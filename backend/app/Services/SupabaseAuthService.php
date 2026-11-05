<?php

namespace App\Services;

use App\Exceptions\AccountDisabledException;
use App\Exceptions\AuthProviderException;
use App\Exceptions\IdentityLoadException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/** Client serveur Supabase Auth + lecture des données propres à l'utilisateur. */
class SupabaseAuthService
{
    private string $url;
    private string $anonKey;

    public function __construct()
    {
        $this->url = rtrim((string) config('services.supabase.url'), '/');
        $this->anonKey = (string) config('services.supabase.anon_key');

        if ($this->url === '' || $this->anonKey === '') {
            throw new RuntimeException('La configuration Supabase est incomplète.');
        }
    }

    private function request(): PendingRequest
    {
        return Http::acceptJson()
            ->asJson()
            ->withHeaders(['apikey' => $this->anonKey])
            ->connectTimeout(5)
            ->timeout(15);
    }

    private function auth(string $method, string $path, ?string $accessToken = null, array $payload = [], array $query = []): array
    {
        $request = $this->request();
        if ($accessToken !== null && $accessToken !== '') {
            $request = $request->withToken($accessToken);
        }

        $response = $request->send($method, $this->url . '/auth/v1/' . ltrim($path, '/'), [
            'query' => $query,
            'json' => $payload,
        ]);

        if (!$response->successful()) {
            throw new AuthProviderException('Le service d’authentification n’a pas accepté la demande.', $response->status());
        }

        return $response->json() ?? [];
    }

    public function register(string $email, string $password, string $fullName, ?string $phone): array
    {
        return $this->auth('POST', 'signup', null, [
            'email' => $email,
            'password' => $password,
            'data' => ['full_name' => $fullName, 'phone' => $phone],
        ]);
    }

    public function login(string $email, string $password): array
    {
        $session = $this->auth('POST', 'token', null, [
            'email' => $email,
            'password' => $password,
        ], ['grant_type' => 'password']);

        return $this->completeSession($session);
    }

    public function refresh(string $refreshToken): array
    {
        $session = $this->auth('POST', 'token', null, [
            'refresh_token' => $refreshToken,
        ], ['grant_type' => 'refresh_token']);

        return $this->completeSession($session);
    }

    private function completeSession(array $session): array
    {
        $accessToken = (string) ($session['access_token'] ?? '');
        $refreshToken = (string) ($session['refresh_token'] ?? '');
        $userId = (string) data_get($session, 'user.id', '');

        if ($accessToken === '' || $refreshToken === '' || $userId === '') {
            throw new RuntimeException('Supabase a renvoyé une session incomplète.');
        }

        $identity = $this->loadIdentity($userId, $accessToken);
        if (($identity['profile']['account_status'] ?? null) !== 'active') {
            // Best effort: invalidate the newly created session before refusing access.
            try { $this->logout($accessToken); } catch (\Throwable) { /* do not mask the refusal */ }
            throw new AccountDisabledException('Ce compte est désactivé. Contactez un responsable.');
        }

        return array_merge($session, $identity);
    }

    public function currentUser(string $accessToken): array
    {
        $user = $this->auth('GET', 'user', $accessToken);
        $userId = (string) ($user['id'] ?? '');
        if ($userId === '') {
            throw new RuntimeException('Identité utilisateur introuvable.');
        }

        $identity = $this->loadIdentity($userId, $accessToken);
        if (($identity['profile']['account_status'] ?? null) !== 'active') {
            throw new AccountDisabledException('Ce compte est désactivé.');
        }

        return array_merge(['user' => $user], $identity);
    }

    private function loadIdentity(string $userId, string $accessToken): array
    {
        $profileResponse = $this->request()->withToken($accessToken)->get($this->url . '/rest/v1/profiles', [
            'id' => 'eq.' . $userId,
            'select' => 'id,full_name,phone,account_status,created_at',
            'limit' => 1,
        ]);

        if (!$profileResponse->successful()) {
            throw new IdentityLoadException('Lecture du profil impossible. Vérifiez la politique RLS de profiles.');
        }
        $profile = $profileResponse->json()[0] ?? null;
        if (!is_array($profile)) {
            throw new IdentityLoadException('Profil introuvable. Vérifiez le trigger de création du profil.');
        }

        // Lire toutes les affectations (actives et inactives) pour ne pas transformer
        // automatiquement un ancien employé en étudiant.
        $assignmentResponse = $this->request()->withToken($accessToken)->get($this->url . '/rest/v1/staff_assignments', [
            'user_id' => 'eq.' . $userId,
            'select' => 'id,restaurant_id,user_id,staff_role,is_active,assigned_at',
        ]);

        if (!$assignmentResponse->successful()) {
            throw new IdentityLoadException('Lecture des affectations impossible. Vérifiez la politique RLS de staff_assignments.');
        }

        $assignments = $assignmentResponse->json() ?? [];
        $activeRoles = [];
        $hasInactiveStaffAssignment = false;
        foreach ($assignments as $assignment) {
            $role = (string) ($assignment['staff_role'] ?? '');
            if (($assignment['is_active'] ?? false) === true && in_array($role, ['employee', 'manager', 'admin'], true)) {
                $activeRoles[] = $role;
            } elseif (($assignment['is_active'] ?? false) !== true && in_array($role, ['employee', 'manager', 'admin'], true)) {
                $hasInactiveStaffAssignment = true;
            }
        }
        $activeRoles = array_values(array_unique($activeRoles));

        // Règle provisoire alignée sur le modèle fourni : sans affectation de personnel,
        // le compte est étudiant. Une affectation de personnel inactive ne donne aucun rôle.
        $roles = $activeRoles;
        if ($roles === [] && !$hasInactiveStaffAssignment && $assignments === []) {
            $roles = ['student'];
        }

        return [
            'profile' => $profile,
            'staff_assignments' => $assignments,
            'roles' => $roles,
            'staff_assignment_inactive' => $hasInactiveStaffAssignment,
        ];
    }

    public function logout(string $accessToken): void
    {
        $this->auth('POST', 'logout', $accessToken);
    }

    public function requestPasswordReset(string $email, string $redirectTo): void
    {
        $this->auth('POST', 'recover', null, ['email' => $email], ['redirect_to' => $redirectTo]);
    }

    public function updatePassword(string $recoveryAccessToken, string $newPassword): void
    {
        $this->auth('PUT', 'user', $recoveryAccessToken, ['password' => $newPassword]);
    }
}
