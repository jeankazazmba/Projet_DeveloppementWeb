<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Lecture de l'identité vérifiée par AuthenticateSupabase et calcul du rôle.
 *
 * FORME D'IDENTITÉ ATTENDUE (à confirmer avec SupabaseAuthService::currentUser) :
 * [
 *   'id'                => 'uuid de l'utilisateur',
 *   'profile'           => ['account_status' => 'active'|'inactive', ...],
 *   'staff_assignments' => [
 *       ['restaurant_id' => 'uuid', 'staff_role' => 'employee'|'manager'|'admin', 'is_active' => true],
 *   ],
 * ]
 * Si la forme réelle diffère, seules userId(), isActive() et activeAssignments() sont à adapter.
 *
 * Règles : le rôle vient UNIQUEMENT de staff_assignments (jamais de user_metadata).
 * Sans affectation active, l'utilisateur est « student ».
 */
class AccessControl
{
    public const STUDENT  = 'student';
    public const EMPLOYEE = 'employee';
    public const MANAGER  = 'manager';
    public const ADMIN    = 'admin';

    /** Un rôle supérieur hérite des droits des rôles inférieurs (proposition, Q-08). */
    private const LEVELS = [
        self::STUDENT  => 0,
        self::EMPLOYEE => 1,
        self::MANAGER  => 2,
        self::ADMIN    => 3,
    ];

    private array $identity;

    public function __construct(array $identity)
    {
        $this->identity = $identity;
    }

    public static function fromRequest(Request $request): ?self
    {
        $identity = $request->attributes->get('supabase_identity');

        if ($identity === null) {
            return null;
        }

        // Accepte un tableau ou un objet.
        $array = json_decode(json_encode($identity), true);

        return is_array($array) ? new self($array) : null;
    }

    public function userId(): ?string
    {
        $id = $this->identity['id'] ?? ($this->identity['user']['id'] ?? null);

        return $id === null ? null : strtolower((string) $id);
    }

    /** Échec fermé : sans statut explicite « active », le compte est refusé. */
    public function isActive(): bool
    {
        return ($this->identity['profile']['account_status'] ?? null) === 'active';
    }

    /** Affectations du personnel actives et valides, sous la forme [restaurant_id, staff_role]. */
    public function activeAssignments(): array
    {
        $result = [];

        foreach (($this->identity['staff_assignments'] ?? []) as $assignment) {
            $role   = $assignment['staff_role'] ?? null;
            $active = filter_var($assignment['is_active'] ?? false, FILTER_VALIDATE_BOOLEAN);

            if (
                $active
                && is_string($role)
                && $role !== self::STUDENT
                && isset(self::LEVELS[$role])
                && !empty($assignment['restaurant_id'])
            ) {
                $result[] = [
                    'restaurant_id' => strtolower((string) $assignment['restaurant_id']),
                    'staff_role'    => $role,
                ];
            }
        }

        return $result;
    }

    /**
     * Rôle le plus élevé pour un restaurant donné.
     * Avec $restaurantId = null, renvoie le rôle le plus élevé tous restaurants confondus
     * (à n'utiliser que pour savoir si la personne est du personnel quelque part).
     */
    public function roleFor(?string $restaurantId): string
    {
        $best   = self::STUDENT;
        $target = $restaurantId === null ? null : strtolower($restaurantId);

        foreach ($this->activeAssignments() as $assignment) {
            if ($target !== null && $assignment['restaurant_id'] !== $target) {
                continue;
            }

            if (self::LEVELS[$assignment['staff_role']] > self::LEVELS[$best]) {
                $best = $assignment['staff_role'];
            }
        }

        return $best;
    }

    public function hasAtLeast(string $minRole, ?string $restaurantId): bool
    {
        if (!isset(self::LEVELS[$minRole])) {
            return false; // rôle inconnu : refus
        }

        return self::LEVELS[$this->roleFor($restaurantId)] >= self::LEVELS[$minRole];
    }

    public function isOwner(?string $ownerId): bool
    {
        return $ownerId !== null
            && $this->userId() !== null
            && $this->userId() === strtolower($ownerId);
    }
}
