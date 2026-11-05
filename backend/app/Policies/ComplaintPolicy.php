<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
{
    private function localRole(User $user, Complaint $complaint): ?string
    {
        if (!$user->is_active || $user->is_platform_admin) return null;
        return $user->restaurants()->whereKey($complaint->restaurant_id)->wherePivot('is_active', true)->first()?->pivot?->role;
    }

    public function view(User $user, Complaint $complaint): bool
    {
        return $user->is_active && !$user->is_platform_admin && (
            $complaint->user_id === $user->id || in_array($this->localRole($user, $complaint), ['employee', 'manager', 'admin'], true)
        );
    }

    public function studentMessage(User $user, Complaint $complaint): bool
    {
        return $complaint->user_id === $user->id && $user->is_active && !in_array($complaint->status, ['resolue', 'rejetee', 'escaladee'], true);
    }

    public function upload(User $user, Complaint $complaint): bool
    {
        return $this->studentMessage($user, $complaint) || ($this->view($user, $complaint) && !in_array($complaint->status, ['resolue', 'rejetee', 'escaladee'], true));
    }

    public function viewAttachment(User $user, Complaint $complaint, string $visibility): bool
    {
        return $this->view($user, $complaint) && ($visibility === 'student' || $complaint->user_id !== $user->id);
    }
}
