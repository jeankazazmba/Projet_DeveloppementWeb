<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Carbon;

class PlatformInsightsController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        $filters = $request->validate([
            'restaurant_id' => ['nullable', Rule::exists('restaurants', 'id')],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ]);
        $restaurantId = $filters['restaurant_id'] ?? null;
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;
        if ($from && $to && $to < $from) {
            throw ValidationException::withMessages(['to' => 'La date de fin doit être postérieure ou égale à la date de début.']);
        }
        $scope = function (string $table) use ($restaurantId, $from, $to) {
            return DB::table($table)
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->when($from, fn ($query) => $query->where('created_at', '>=', Carbon::parse($from, 'Africa/Kinshasa')->startOfDay()->utc()))
                ->when($to, fn ($query) => $query->where('created_at', '<', Carbon::parse($to, 'Africa/Kinshasa')->addDay()->startOfDay()->utc()));
        };
        $contentScope = fn () => DB::table('restaurant_contents')
            ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId));

        $orderTotals = $scope('orders')->selectRaw("restaurant_id, COUNT(*) as orders, SUM(CASE WHEN status IN ('Annulée', 'cancelled') THEN 0 ELSE amount_cdf END) as order_volume_cdf")->groupBy('restaurant_id')->get()->keyBy('restaurant_id');
        $complaintTotals = $scope('complaints')->where('escalated', true)->selectRaw('restaurant_id, COUNT(*) as escalated_complaints')->groupBy('restaurant_id')->get()->keyBy('restaurant_id');
        $contentTotals = $contentScope()->where('is_published', true)->selectRaw("restaurant_id, COUNT(*) as published_contents, SUM(CASE WHEN kind = 'dish' THEN 1 ELSE 0 END) as dishes, SUM(CASE WHEN kind = 'promotion' THEN 1 ELSE 0 END) as promotions, SUM(CASE WHEN kind = 'event' THEN 1 ELSE 0 END) as events, SUM(CASE WHEN kind = 'game' THEN 1 ELSE 0 END) as games")->groupBy('restaurant_id')->get()->keyBy('restaurant_id');
        $loyaltyTotals = $scope('loyalty_movements')->selectRaw('restaurant_id, SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as points_issued, SUM(CASE WHEN points < 0 THEN -points ELSE 0 END) as points_used')->groupBy('restaurant_id')->get()->keyBy('restaurant_id');
        $referralTotals = $scope('referrals')->selectRaw('restaurant_id, COUNT(*) as referrals')->groupBy('restaurant_id')->get()->keyBy('restaurant_id');
        $byRestaurant = DB::table('restaurants')->select('id')
            ->when($restaurantId, fn ($query) => $query->where('id', $restaurantId))
            ->orderBy('name')->get()->map(function ($restaurant) use ($orderTotals, $complaintTotals, $contentTotals, $loyaltyTotals, $referralTotals) {
                $id = $restaurant->id;
                return [
                    'restaurant_id' => $id,
                    'orders' => (int) ($orderTotals->get($id)?->orders ?? 0),
                    'order_volume_cdf' => (int) ($orderTotals->get($id)?->order_volume_cdf ?? 0),
                    'escalated_complaints' => (int) ($complaintTotals->get($id)?->escalated_complaints ?? 0),
                    'published_contents' => (int) ($contentTotals->get($id)?->published_contents ?? 0),
                    'dishes' => (int) ($contentTotals->get($id)?->dishes ?? 0),
                    'promotions' => (int) ($contentTotals->get($id)?->promotions ?? 0),
                    'events' => (int) ($contentTotals->get($id)?->events ?? 0),
                    'games' => (int) ($contentTotals->get($id)?->games ?? 0),
                    'points_issued' => (int) ($loyaltyTotals->get($id)?->points_issued ?? 0),
                    'points_used' => (int) ($loyaltyTotals->get($id)?->points_used ?? 0),
                    'referrals' => (int) ($referralTotals->get($id)?->referrals ?? 0),
                ];
            });
        $escalations = $scope('complaints')->where('escalated', true)
            ->select(['id', 'restaurant_id', 'status', 'created_at'])
            ->orderByDesc('created_at')->limit(100)->get();

        $firstMonth = ($to ? Carbon::parse($to, 'Africa/Kinshasa') : Carbon::now('Africa/Kinshasa'))->startOfMonth()->subMonths(5);
        $localDay = DB::getDriverName() === 'sqlite' ? "DATE(datetime(created_at, '+1 hour'))" : 'DATE(DATE_ADD(created_at, INTERVAL 1 HOUR))';
        $dailyOrders = $scope('orders')->where('created_at', '>=', $firstMonth->copy()->startOfDay()->utc())
            ->selectRaw("restaurant_id, {$localDay} as day, COUNT(*) as orders, SUM(CASE WHEN status IN ('Annulée', 'cancelled') THEN 0 ELSE amount_cdf END) as order_volume_cdf")
            ->groupBy('restaurant_id', DB::raw($localDay))->get();
        $monthlyOrders = $dailyOrders->groupBy(fn ($row) => substr($row->day, 0, 7));
        $trends = collect(range(0, 5))->map(function ($offset) use ($firstMonth, $monthlyOrders) {
            $month = $firstMonth->copy()->addMonths($offset)->format('Y-m');
            $rows = $monthlyOrders->get($month, collect());
            return ['month' => $month, 'orders' => (int) $rows->sum('orders'), 'order_volume_cdf' => (int) $rows->sum('order_volume_cdf')];
        });

        return response()->json([
            'summary' => [
                'orders' => $byRestaurant->sum('orders'),
                'order_volume_cdf' => $byRestaurant->sum('order_volume_cdf'),
                'escalated_complaints' => $byRestaurant->sum('escalated_complaints'),
                'points_issued' => $byRestaurant->sum('points_issued'),
                'points_used' => $byRestaurant->sum('points_used'),
                'referrals' => $byRestaurant->sum('referrals'),
                'published_contents' => $byRestaurant->sum('published_contents'),
            ],
            'by_restaurant' => $byRestaurant,
            'complaints' => $escalations,
            'trends' => $trends,
            'limits' => ['complaints' => 100],
            'has_demo_rows' => $scope('orders')->where('is_demo', true)->exists()
                || $scope('complaints')->where('is_demo', true)->exists()
                || $scope('loyalty_movements')->where('is_demo', true)->exists()
                || $scope('referrals')->where('is_demo', true)->exists(),
            'filters' => $filters,
        ]);
    }

    public function audit(Request $request)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        $filters = $request->validate(['restaurant_id' => ['nullable', Rule::exists('restaurants', 'id')]]);
        return DB::table('platform_audit_logs as log')
            ->leftJoin('users as actor', 'actor.id', '=', 'log.actor_id')
            ->select('log.id', 'log.restaurant_id', 'log.action', 'log.target_type', 'log.target_id', 'log.reason', 'log.created_at', 'actor.name as actor_name')
            ->where('log.action', 'not like', 'content.%')
            ->when($filters['restaurant_id'] ?? null, fn ($query, $id) => $query->where('log.restaurant_id', $id))
            ->orderByDesc('log.id')->limit(100)->get();
    }
}
