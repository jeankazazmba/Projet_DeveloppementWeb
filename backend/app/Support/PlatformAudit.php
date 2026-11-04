<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class PlatformAudit
{
    public static function record(User $actor, string $action, string $targetType, string $targetId, ?string $restaurantId = null, ?string $reason = null, array $changes = []): void
    {
        DB::table('platform_audit_logs')->insert([
            'actor_id' => $actor->id,
            'restaurant_id' => $restaurantId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'reason' => $reason,
            'changes' => json_encode($changes, JSON_UNESCAPED_UNICODE),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
