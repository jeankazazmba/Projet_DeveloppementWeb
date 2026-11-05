<?php

namespace App\Http\Middleware;

use App\Exceptions\AccountDisabledException;
use App\Exceptions\AuthProviderException;
use App\Services\SupabaseAuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Vérifie le jeton Supabase et expose l'identité aux contrôleurs et aux permissions :
 *   $request->attributes->get('supabase_identity')     => ['user', 'profile', 'roles', 'staff_assignments', 'staff_assignment_inactive']
 *   $request->attributes->get('supabase_access_token') => jeton Bearer (à ne jamais journaliser)
 */
class AuthenticateSupabase
{
    public function __construct(private SupabaseAuthService $supabase) {}

    private function error(string $message, int $status, string $code): Response
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'error' => ['code' => $code, 'details' => null],
        ], $status);
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if (!$token) {
            return $this->error('Authentification requise.', 401, 'UNAUTHORIZED');
        }

        try {
            $identity = $this->supabase->currentUser($token);
            $request->attributes->set('supabase_identity', $identity);
            $request->attributes->set('supabase_access_token', $token);
        } catch (AccountDisabledException) {
            return $this->error('Ce compte est désactivé. Contactez un responsable.', 403, 'ACCOUNT_DISABLED');
        } catch (AuthProviderException $e) {
            if ($e->isClientRefusal()) {
                return $this->error('Session invalide ou expirée.', 401, 'UNAUTHORIZED');
            }
            Log::warning('auth.provider_unavailable', ['status' => $e->providerStatus]);
            return $this->error('Le service d’authentification est momentanément indisponible.', 502, 'AUTH_PROVIDER_ERROR');
        } catch (Throwable $e) {
            // Profil/affectations illisibles (RLS, trigger) ou autre erreur : ce n'est pas une session invalide.
            Log::error('auth.internal_error', ['type' => $e::class, 'message' => $e->getMessage()]);
            return $this->error('Une erreur interne est survenue.', 500, 'INTERNAL_ERROR');
        }

        return $next($request);
    }
}
