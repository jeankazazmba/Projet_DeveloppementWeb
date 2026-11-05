<?php

namespace App\Support;

use App\Models\Complaint;

class ComplaintView
{
    public static function forStudent(Complaint $complaint): array
    {
        $complaint->loadMissing(['messages', 'attachments', 'events']);
        return [
            'id' => $complaint->id, 'restaurant_id' => $complaint->restaurant_id,
            'order_id' => $complaint->order_id, 'reason' => $complaint->reason,
            'status' => $complaint->status, 'version' => $complaint->version,
            'created_at' => $complaint->created_at, 'updated_at' => $complaint->updated_at,
            'messages' => $complaint->messages->where('visibility', 'student')->values(),
            'attachments' => $complaint->attachments->where('visibility', 'student')->values(),
            'events' => $complaint->events->map(fn ($event) => [
                'to_status' => $event->to_status, 'complaint_version' => $event->complaint_version,
                'created_at' => $event->created_at,
            ]),
        ];
    }

    public static function forStaff(Complaint $complaint): array
    {
        $complaint->loadMissing(['messages', 'attachments', 'events']);
        return [
            'id' => $complaint->id, 'restaurant_id' => $complaint->restaurant_id,
            'order_id' => $complaint->order_id, 'student_name' => $complaint->student_name,
            'reason' => $complaint->reason, 'status' => $complaint->status,
            'escalated' => $complaint->escalated, 'version' => $complaint->version,
            'created_at' => $complaint->created_at, 'updated_at' => $complaint->updated_at,
            'messages' => $complaint->messages, 'attachments' => $complaint->attachments,
            'events' => $complaint->events->map(fn ($event) => [
                'from_status' => $event->from_status, 'to_status' => $event->to_status,
                'reason' => $event->reason, 'actor_id' => $event->getRawOriginal('actor_id'),
                'complaint_version' => $event->complaint_version, 'created_at' => $event->created_at,
            ]),
        ];
    }
}
