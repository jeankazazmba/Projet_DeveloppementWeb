<?php
declare(strict_types=1);

final class Auth
{
    public static function user(PDO $db): array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) Api::fail(401, 'unauthorized', 'Authentification requise.');
        $q = $db->prepare('SELECT u.id, u.nom, u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()');
        $q->execute([hash('sha256', $m[1])]);
        $user = $q->fetch();
        if (!$user) Api::fail(401, 'unauthorized', 'Session invalide ou expirée.');
        return $user;
    }

    public static function requireRole(array $user, array $roles): void
    {
        if (!in_array($user['role'], $roles, true)) Api::fail(403, 'forbidden', 'Droits insuffisants.');
    }
}
