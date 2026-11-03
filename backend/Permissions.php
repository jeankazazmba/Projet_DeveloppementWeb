<?php

namespace App\Support;

/**
 * Matrice des permissions du module (proposition à faire valider : Q-08).
 *
 *  - 'owner' : le propriétaire de la ressource est autorisé.
 *  - 'staff' : rôle minimal du personnel pour le restaurant de la ressource (null = aucun accès du personnel).
 *
 * Une action absente de la matrice est REFUSÉE (échec fermé).
 *
 * Pour une ressource d'un autre client, répondre 404 (et non 403) afin de ne pas révéler son existence.
 */
class Permissions
{
    public const MATRIX = [
        // Commandes
        'order.create'             => ['owner' => true,  'staff' => null],
        'order.view'               => ['owner' => true,  'staff' => AccessControl::EMPLOYEE],
        'order.change_status'      => ['owner' => false, 'staff' => AccessControl::EMPLOYEE],

        // Menu
        'product.set_availability' => ['owner' => false, 'staff' => AccessControl::EMPLOYEE],
        'product.manage'           => ['owner' => false, 'staff' => AccessControl::ADMIN],

        // Réclamations
        'complaint.create'         => ['owner' => true,  'staff' => null],
        'complaint.view'           => ['owner' => true,  'staff' => AccessControl::EMPLOYEE],
        'complaint.propose'        => ['owner' => false, 'staff' => AccessControl::EMPLOYEE],
        'complaint.approve'        => ['owner' => false, 'staff' => AccessControl::MANAGER],

        // Administration du restaurant
        'staff.manage'             => ['owner' => false, 'staff' => AccessControl::MANAGER],
        'settings.update'          => ['owner' => false, 'staff' => AccessControl::ADMIN],
    ];

    /**
     * @param string|null $restaurantId restaurant de la ressource
     * @param string|null $ownerId      client propriétaire de la ressource (si elle en a un)
     */
    public static function allows(
        AccessControl $access,
        string $action,
        ?string $restaurantId,
        ?string $ownerId = null
    ): bool {
        if (!$access->isActive()) {
            return false;
        }

        $rule = self::MATRIX[$action] ?? null;

        if ($rule === null) {
            return false;
        }

        if (($rule['owner'] ?? false) && $access->isOwner($ownerId)) {
            return true;
        }

        $staff = $rule['staff'] ?? null;

        return $staff !== null
            && $restaurantId !== null
            && $access->hasAtLeast($staff, $restaurantId);
    }
}
