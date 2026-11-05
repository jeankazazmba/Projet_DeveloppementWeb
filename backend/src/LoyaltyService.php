<?php
declare(strict_types=1);

final class LoyaltyService
{
    public static function balance(PDO $db, int $userId): int
    {
        $q = $db->prepare("SELECT COALESCE(SUM(CASE WHEN type='debit' THEN -points ELSE points END),0) FROM loyalty_transactions WHERE user_id=?");
        $q->execute([$userId]);
        return (int)$q->fetchColumn();
    }

    /** À appeler une fois qu'une commande est effectivement servie/livrée, dans la transaction de commande. */
    public static function creditForOrder(PDO $db, int $orderId): int
    {
        $q = $db->prepare("SELECT o.user_id,o.total_amount,r.currency_per_point FROM orders o CROSS JOIN loyalty_rules r WHERE o.id=? AND r.id=1 AND o.status IN ('servie','livree') AND o.completed_at IS NOT NULL FOR UPDATE");
        $q->execute([$orderId]);
        $row = $q->fetch();
        if (!$row || (int)$row['currency_per_point'] < 1) return 0;
        $points = intdiv((int)$row['total_amount'], (int)$row['currency_per_point']);
        if ($points < 1) return 0;
        $q = $db->prepare("INSERT IGNORE INTO loyalty_transactions(user_id,order_id,type,points,reason,idempotency_key) VALUES(?,?,'credit',?,'Commande réussie',?)");
        $q->execute([(int)$row['user_id'], $orderId, $points, 'order-earned:'.$orderId]);
        return $q->rowCount() ? $points : 0;
    }

    /** Débite des points à l'intérieur d'une transaction PDO active. */
    public static function redeem(PDO $db, int $userId, int $orderId, int $points, string $key): int
    {
        if ($points < 1 || $points > 1000000) Api::fail(422, 'validation_error', 'Nombre de points invalide.');
        $q = $db->prepare('SELECT currency_per_point,points_per_reward,reward_amount FROM loyalty_rules WHERE id=1 FOR UPDATE');
        $q->execute(); $rules = $q->fetch();
        if (!$rules || (int)$rules['points_per_reward'] < 1 || (int)$rules['reward_amount'] < 1) Api::fail(409, 'loyalty_not_configured', 'Les règles de fidélité ne sont pas encore configurées.');
        if ($points % (int)$rules['points_per_reward'] !== 0) Api::fail(422, 'invalid_redemption', 'Les points doivent correspondre à un seuil de récompense.');
        if (self::balance($db, $userId) < $points) Api::fail(409, 'insufficient_points', 'Solde de points insuffisant.');
        $q = $db->prepare("INSERT INTO loyalty_transactions(user_id,order_id,type,points,reason,idempotency_key) VALUES(?,?,'debit',?,'Utilisation de points',?)");
        try { $q->execute([$userId, $orderId, $points, $key]); }
        catch (PDOException $e) { if ($e->getCode()==='23000') Api::fail(409, 'duplicate_operation', 'Cette opération a déjà été traitée.'); throw $e; }
        return intdiv($points, (int)$rules['points_per_reward']) * (int)$rules['reward_amount'];
    }
}
