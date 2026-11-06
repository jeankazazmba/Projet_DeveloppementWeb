<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class PersistDomainNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public int $userId,
        public ?string $restaurantId,
        public string $audience,
        public string $type,
        public string $eventKey,
        public array $data,
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        $user = User::find($this->userId);
        if (!$user?->is_active) return;
        if ($this->audience === 'platform' && !$user->is_platform_admin) return;
        if ($this->audience === 'student' && ($user->is_platform_admin || !$user->studentProfile()->exists())) return;
        if ($this->audience === 'staff' && ($user->is_platform_admin || !$user->restaurants()->whereKey($this->restaurantId)->wherePivot('is_active', true)->exists())) return;
        DB::table('app_notifications')->insertOrIgnore([
            'user_id' => $this->userId, 'restaurant_id' => $this->restaurantId,
            'audience' => $this->audience, 'type' => $this->type, 'event_key' => $this->eventKey,
            'data' => json_encode($this->data, JSON_THROW_ON_ERROR), 'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}
