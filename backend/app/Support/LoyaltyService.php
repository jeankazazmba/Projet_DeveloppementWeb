<?php

namespace App\Support;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

class LoyaltyService
{
    /** Appeler dans la transaction de finalisation de la commande. */
    public static function awardForOrder(Order $order): void
    {
        if (!$order->user_id || !in_array($order->status, ['served', 'delivered'], true)) return;
        $rule = DB::table('loyalty_rules')->where('restaurant_id', $order->restaurant_id)
            ->where('is_active', true)->whereNotNull('validated_at')->orderByDesc('id')->first();
        if (!$rule) return;
        if ($rule->points_per_order > 0) DB::table('loyalty_movements')->insertOrIgnore([
            'restaurant_id' => $order->restaurant_id, 'user_id' => $order->user_id,
            'points' => $rule->points_per_order, 'reason' => 'Commande éligible',
            'reference' => $order->id, 'order_id' => $order->id,
            'event_key' => 'order:'.$order->id.':earned', 'loyalty_rule_id' => $rule->id,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $referral = DB::table('referrals')->where('restaurant_id', $order->restaurant_id)
            ->where('referee_id', $order->user_id)->where('status', 'pending')->lockForUpdate()->first();
        if (!$referral) return;
        if ($rule->referral_points > 0) DB::table('loyalty_movements')->insertOrIgnore([
            'restaurant_id' => $order->restaurant_id, 'user_id' => $referral->referrer_id,
            'points' => $rule->referral_points, 'reason' => 'Parrainage confirmé',
            'reference' => $order->id, 'order_id' => $order->id,
            'event_key' => 'referral:'.$referral->id.':reward', 'loyalty_rule_id' => $rule->id,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('referrals')->where('id', $referral->id)->update([
            'status' => 'rewarded', 'rewarded_points' => $rule->referral_points,
            'rewarded_at' => now(), 'updated_at' => now(),
        ]);
    }
}
