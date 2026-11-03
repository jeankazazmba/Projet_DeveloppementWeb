<?php

namespace App\Http\Middleware;

use App\Support\AccessControl;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exige un rôle minimal pour le restaurant ciblé par la route.
 * À placer APRÈS AuthenticateSupabase.
 *
 * Utilisation : EnsureRole::class . ':employee'   (paramètre de route {restaurant_id})
 *               EnsureRole::class . ':manager,id_restaurant'  (autre nom de paramètre)
 */
class EnsureRole
{
    public function handle(
        Request $request,
        Closure $next,
        string $minRole = AccessControl::EMPLOYEE,
        string $restaurantParam = 'restaurant_id'
    ): Response {
        $access = AccessControl::fromRequest($request);

        if ($access === null) {
            return $this->error('UNAUTHENTICATED', 'Authentification requise.', 401);
        }

        if (!$access->isActive()) {
            return $this->error('ACCOUNT_DISABLED', 'Compte désactivé.', 403);
        }

        // Tout utilisateur actif est au moins « student » : pas de contexte restaurant nécessaire.
        if ($minRole === AccessControl::STUDENT) {
            return $next($request);
        }

        $restaurantId = $request->route($restaurantParam) ?? $request->input($restaurantParam);

        if (!is_string($restaurantId) || !Str::isUuid($restaurantId)) {
            return $this->error('VALIDATION_ERROR', 'Identifiant de restaurant invalide ou manquant.', 422);
        }

        if (!$access->hasAtLeast($minRole, $restaurantId)) {
            return $this->error('FORBIDDEN', 'Action non autorisée pour votre rôle.', 403);
        }

        return $next($request);
    }

    private function error(string $code, string $message, int $status): Response
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'code'    => $code,
        ], $status);
    }
}
