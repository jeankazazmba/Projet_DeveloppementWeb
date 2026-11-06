<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    private function visible(Request $request)
    {
        $user = $request->user();
        $restaurantIds = $user->is_platform_admin ? [] : $user->restaurants()->wherePivot('is_active', true)->pluck('restaurants.id')->all();
        return DB::table('app_notifications')->where('user_id', $user->id)->where(function ($q) use ($user, $restaurantIds) {
            if ($user->is_platform_admin) $q->where('audience', 'platform');
            else {
                if (!$user->studentProfile()->exists() && !$restaurantIds) $q->whereRaw('1 = 0');
                if ($user->studentProfile()->exists()) $q->orWhere('audience', 'student');
                if ($restaurantIds) $q->orWhere(fn ($staff) => $staff->where('audience', 'staff')->whereIn('restaurant_id', $restaurantIds));
            }
        });
    }

    public function index(Request $request)
    {
        $data = $request->validate(['after_id' => ['nullable', 'integer', 'min:0'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'unread' => ['nullable', 'boolean']]);
        $query = $this->visible($request);
        $unread = (clone $query)->whereNull('read_at')->count();
        $items = $query->when($data['after_id'] ?? null, fn ($q, $id) => $q->where('id', '>', $id))
            ->when($request->boolean('unread'), fn ($q) => $q->whereNull('read_at'))
            ->orderByDesc('id')->paginate($data['per_page'] ?? 25, ['id', 'restaurant_id', 'type', 'data', 'read_at', 'created_at']);
        $items->getCollection()->transform(function ($row) { $row->data = json_decode($row->data, true); return $row; });
        return response()->json(['unread_count' => $unread, 'notifications' => $items]);
    }

    public function read(Request $request, int $notification)
    {
        $row = $this->visible($request)->where('id', $notification)->first();
        abort_unless($row, 404);
        DB::table('app_notifications')->where('id', $notification)->whereNull('read_at')->update(['read_at' => now(), 'updated_at' => now()]);
        return ['id' => $notification, 'read_at' => DB::table('app_notifications')->where('id', $notification)->value('read_at')];
    }
}
