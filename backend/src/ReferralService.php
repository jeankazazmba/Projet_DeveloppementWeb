<?php
declare(strict_types=1);

final class ReferralService
{
    /** Appelé dans la transaction de finalisation de commande réussie. */
    public static function rewardAfterSuccessfulOrder(PDO $db, int $orderId): int
    {
        $q = $db->prepare("SELECT r.id,r.referrer_id,lr.referral_reward_points FROM referrals r JOIN orders o ON o.user_id=r.referred_id CROSS JOIN loyalty_rules lr WHERE o.id=? AND o.status IN ('servie','livree') AND o.completed_at IS NOT NULL AND r.status='pending' AND lr.id=1 AND NOT EXISTS (SELECT 1 FROM orders previous WHERE previous.user_id=o.user_id AND previous.status IN ('servie','livree') AND previous.completed_at IS NOT NULL AND (previous.completed_at<o.completed_at OR (previous.completed_at=o.completed_at AND previous.id<o.id))) FOR UPDATE");
        $q->execute([$orderId]); $row = $q->fetch();
        if (!$row || (int)$row['referral_reward_points'] < 1) return 0;
        $q = $db->prepare("INSERT IGNORE INTO loyalty_transactions(user_id,type,points,reason,idempotency_key) VALUES(?,'credit',?,'Récompense de parrainage',?)");
        $q->execute([(int)$row['referrer_id'], (int)$row['referral_reward_points'], 'referral:'.$row['id']]);
        if (!$q->rowCount()) return 0;
        $db->prepare("UPDATE referrals SET status='rewarded',rewarded_at=UTC_TIMESTAMP() WHERE id=? AND status='pending'")->execute([(int)$row['id']]);
        return (int)$row['referral_reward_points'];
    }
}
