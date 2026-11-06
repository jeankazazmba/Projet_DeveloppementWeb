<?php

namespace App\Support;

use App\Jobs\PersistDomainNotification;
use App\Models\User;

class DomainNotifications
{
    public static function student(int $userId, string $restaurantId, string $type, string $key, array $data): void
    {
        PersistDomainNotification::dispatch($userId, $restaurantId, 'student', $type, $key, $data)->afterCommit();
    }

    public static function staff(string $restaurantId, string $type, string $key, array $data): void
    {
        User::where('is_active', true)->where('is_platform_admin', false)
            ->whereHas('restaurants', fn ($q) => $q->where('restaurants.id', $restaurantId)->where('restaurant_user.is_active', true))
            ->pluck('id')->each(fn ($id) => PersistDomainNotification::dispatch((int) $id, $restaurantId, 'staff', $type, $key, $data)->afterCommit());
    }

    public static function staffMember(int $userId, string $restaurantId, string $type, string $key, array $data): void
    {
        PersistDomainNotification::dispatch($userId, $restaurantId, 'staff', $type, $key, $data)->afterCommit();
    }

    public static function platformEscalation(string $restaurantId, string $complaintId, string $status): void
    {
        User::where('is_active', true)->where('is_platform_admin', true)->pluck('id')
            ->each(fn ($id) => PersistDomainNotification::dispatch((int) $id, $restaurantId, 'platform',
                'complaint_escalated', 'complaint:'.$complaintId.':'.$status,
                ['complaint_id' => $complaintId, 'restaurant_id' => $restaurantId, 'status' => $status, 'date' => now()->toIso8601String()])->afterCommit());
    }
}
