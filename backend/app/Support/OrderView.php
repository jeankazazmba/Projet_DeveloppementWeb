<?php

namespace App\Support;

use App\Models\Order;

class OrderView
{
    public static function forStaff(Order $order, string $role, int $actorId): array
    {
        $canSeeAddress = in_array($role, ['admin', 'manager'], true)
            || ($role === 'employee' && $order->delivery_assignee_id === $actorId
                && !in_array($order->status, ['delivered', 'cancelled'], true));
        $order->loadMissing(['lines', 'events', 'table']);
        return [
            'id' => $order->id, 'restaurant_id' => $order->restaurant_id,
            'customer_name' => $order->customer_name, 'service' => $order->service,
            'status' => $order->status, 'version' => $order->version,
            'requested_at' => $order->requested_at, 'created_at' => $order->created_at,
            'amount_cdf' => $order->amount_cdf, 'delivery_fee_cdf' => $order->delivery_fee_cdf,
            'lines' => $order->lines, 'table' => $order->table?->only(['id', 'code', 'capacity']),
            'party_size' => $order->party_size,
            'delivery_zone' => $order->delivery_zone_snapshot ? ['district' => $order->delivery_zone_snapshot['district']] : null,
            'delivery_assignee_id' => in_array($role, ['admin', 'manager'], true) ? $order->delivery_assignee_id : null,
            'delivery_address' => $canSeeAddress ? $order->delivery_address_snapshot : null,
            'events' => $order->events->map(fn ($event) => [
                'action' => $event->action, 'from_status' => $event->from_status,
                'to_status' => $event->to_status, 'reason' => $event->reason,
                'order_version' => $event->order_version, 'actor_id' => $event->getRawOriginal('actor_id'),
                'created_at' => $event->created_at,
            ]),
        ];
    }
}
