<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AccountDisabledException;
use App\Exceptions\AuthProviderException;
use App\Exceptions\IdentityLoadException;
use App\Http\Controllers\Controller;
use App\Services\SupabaseAuthService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Throwable;

class AuthController extends Controller
{
    public function __construct(private SupabaseAuthService $supabase) {}

    private function passwordRules(): array
    {
        // Le cahier des charges exige au moins une majuscule et un chiffre.
        return ['required', 'string', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'confirmed'];
    }

    /** Enveloppe commune : success, message, data, error (conventions communes de l'API). */
    private function ok(string $message, mixed $data = null, int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data, 'error' => null], $status);
    }

    private function fail(string $message, int $status, string $code, mixed $details = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'error' => ['code' => $code, 'details' => $details],
        ], $status);
    }

    /** Valide la requête ; en cas d'échec, renvoie 422 VALIDATION_ERROR au format commun (et non le format natif de Laravel). */
    private function validated(Request $request, array $rules): array
    {
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            throw new HttpResponseException(
                $this->fail('Les données fournies sont invalides.', 422, 'VALIDATION_ERROR', $validator->errors()->toArray())
            );
        }

        return $validator->validated();
    }

    /** Erreurs techniques communes : problème de configuration/RLS (500) ou panne Supabase (502). */
    private function technicalFailure(Throwable $e): JsonResponse
    {
        if ($e instanceof AuthProviderException && !$e->isClientRefusal()) {
            Log::warning('auth.provider_unavailable', ['status' => $e->providerStatus]);
            return $this->fail('Le service d’authentification est momentanément indisponible.', 502, 'AUTH_PROVIDER_ERROR');
        }

        // Ne jamais journaliser de jeton ni de mot de passe : seulement le message technique.
        Log::error('auth.internal_error', ['type' => $e::class, 'message' => $e->getMessage()]);
        return $this->fail('Une erreur interne est survenue.', 500, 'INTERNAL_ERROR');
    }

    public function register(Request $request)
    {
        $validated = $this->validated($request, [
            'full_name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:254'],
            'phone' => ['required', 'string', 'max:30'],
            'password' => $this->passwordRules(),
        ]);

        try {
            $result = $this->supabase->register(
                $validated['email'], $validated['password'], $validated['full_name'], $validated['phone']
            );

            return $this->ok(
                'Inscription enregistrée. Vérifiez votre adresse e-mail si la confirmation est activée.',
                [
                    'user_id' => data_get($result, 'user.id'),
                    'email_confirmation_required' => empty(data_get($result, 'session.access_token')),
                ],
                201
            );
        } catch (AuthProviderException $e) {
            if ($e->isClientRefusal()) {
                // Message volontairement vague (adresse déjà utilisée, mot de passe refusé…) pour ne pas révéler les comptes existants.
                return $this->fail('Inscription impossible. Vérifiez les informations saisies.', 422, 'REGISTRATION_FAILED');
            }
            return $this->technicalFailure($e);
        } catch (Throwable $e) {
            return $this->technicalFailure($e);
        }
    }

    public function login(Request $request)
    {
        $validated = $this->validated($request, [
            'email' => ['required', 'email:rfc', 'max:254'],
            'password' => ['required', 'string'],
        ]);

        $key = 'auth-login:' . sha1((string) $request->ip() . '|' . strtolower($validated['email']));
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return $this->fail('Trop de tentatives. Réessayez dans une minute.', 429, 'RATE_LIMIT_EXCEEDED');
        }

        try {
            $data = $this->supabase->login($validated['email'], $validated['password']);
            RateLimiter::clear($key);

            return $this->ok('Connexion réussie.', $this->sessionPayload($data));
        } catch (AccountDisabledException) {
            RateLimiter::hit($key, 60);
            return $this->fail('Ce compte est désactivé. Contactez un responsable.', 403, 'ACCOUNT_DISABLED');
        } catch (AuthProviderException $e) {
            if ($e->isClientRefusal()) {
                RateLimiter::hit($key, 60);
                // Même message pour « e-mail inconnu » et « mauvais mot de passe ».
                return $this->fail('Identifiants incorrects.', 401, 'INVALID_CREDENTIALS');
            }
            return $this->technicalFailure($e);
        } catch (IdentityLoadException $e) {
            return $this->technicalFailure($e);
        } catch (Throwable $e) {
            return $this->technicalFailure($e);
        }
    }

    public function refresh(Request $request)
    {
        $validated = $this->validated($request, ['refresh_token' => ['required', 'string']]);

        try {
            $data = $this->supabase->refresh($validated['refresh_token']);
            return $this->ok('Session renouvelée.', $this->sessionPayload($data));
        } catch (AccountDisabledException) {
            return $this->fail('Ce compte est désactivé. Contactez un responsable.', 403, 'ACCOUNT_DISABLED');
        } catch (AuthProviderException $e) {
            if ($e->isClientRefusal()) {
                return $this->fail('Session expirée ou jeton de renouvellement invalide. Veuillez vous reconnecter.', 401, 'SESSION_INVALID');
            }
            return $this->technicalFailure($e);
        } catch (Throwable $e) {
            return $this->technicalFailure($e);
        }
    }

    private function sessionPayload(array $data): array
    {
        return [
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'],
            'token_type' => $data['token_type'] ?? 'bearer',
            'expires_in' => $data['expires_in'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'user' => ['id' => data_get($data, 'user.id'), 'email' => data_get($data, 'user.email')],
            'profile' => $data['profile'],
            'roles' => $data['roles'],
            'staff_assignments' => $data['staff_assignments'],
            'staff_assignment_inactive' => $data['staff_assignment_inactive'],
        ];
    }

    public function me(Request $request)
    {
        // L'identité a été chargée et vérifiée par le middleware AuthenticateSupabase.
        return $this->ok('Compte récupéré.', $request->attributes->get('supabase_identity'));
    }

    public function logout(Request $request)
    {
        try {
            $this->supabase->logout((string) $request->attributes->get('supabase_access_token'));
            return $this->ok('Déconnexion demandée à Supabase.');
        } catch (Throwable $e) {
            Log::warning('auth.logout_unconfirmed', ['type' => $e::class]);
            return $this->fail('La déconnexion n’a pas pu être confirmée par Supabase.', 502, 'AUTH_PROVIDER_ERROR');
        }
    }

    public function forgotPassword(Request $request)
    {
        $validated = $this->validated($request, ['email' => ['required', 'email:rfc', 'max:254']]);

        try {
            $redirect = (string) config('services.supabase.password_reset_redirect');
            if ($redirect !== '') {
                $this->supabase->requestPasswordReset($validated['email'], $redirect);
            }
        } catch (Throwable) {
            // Réponse volontairement identique pour ne pas révéler l'existence d'un compte.
        }

        return $this->ok('Si cette adresse correspond à un compte, un e-mail de réinitialisation sera envoyé.');
    }

    public function resetPassword(Request $request)
    {
        $validated = $this->validated($request, [
            'access_token' => ['required', 'string'],
            'password' => $this->passwordRules(),
        ]);

        try {
            $this->supabase->updatePassword($validated['access_token'], $validated['password']);
            return $this->ok('Mot de passe mis à jour.');
        } catch (AuthProviderException $e) {
            if ($e->isClientRefusal()) {
                return $this->fail('Lien de réinitialisation invalide ou expiré.', 422, 'INVALID_RESET_TOKEN');
            }
            return $this->technicalFailure($e);
        } catch (Throwable $e) {
            return $this->technicalFailure($e);
        }
    }
}
