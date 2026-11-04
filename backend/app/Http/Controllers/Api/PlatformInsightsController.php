<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

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
                ->when($from, fn ($query) => $query->whereDate('created_at', '>=', $from))
                ->when($to, fn ($query) => $query->whereDate('created_at', '<=', $to));
        };
        $contentScope = fn () => DB::table('restaurant_contents')
            ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId));

        $orders = $scope('orders')->orderByDesc('created_at')->limit(100)->get();
        $complaints = $scope('complaints')->where('escalated', true)->orderByDesc('created_at')->limit(100)->get();
        $loyalty = $scope('loyalty_movements')->orderByDesc('created_at')->limit(100)->get();
        $referrals = $scope('referrals')->orderByDesc('created_at')->limit(100)->get();
        $contents = $contentScope()->orderByDesc('updated_at')->limit(200)->get();

        return response()->json([
            'summary' => [
                'orders' => $scope('orders')->count(),
                'order_volume_cdf' => $scope('orders')->whereNotIn('status', ['Annulée', 'cancelled'])->sum('amount_cdf'),
                'escalated_complaints' => $scope('complaints')->where('escalated', true)->count(),
                'points_issued' => $scope('loyalty_movements')->where('points', '>', 0)->sum('points'),
                'points_used' => abs($scope('loyalty_movements')->where('points', '<', 0)->sum('points')),
                'referrals' => $scope('referrals')->count(),
                'published_contents' => $contentScope()->where('is_published', true)->count(),
            ],
            'by_restaurant' => $scope('orders')->selectRaw("restaurant_id, COUNT(*) as orders, SUM(CASE WHEN status IN ('Annulée', 'cancelled') THEN 0 ELSE amount_cdf END) as order_volume_cdf")->groupBy('restaurant_id')->get(),
            'orders' => $orders,
            'complaints' => $complaints,
            'loyalty' => $loyalty,
            'referrals' => $referrals,
            'contents' => $contents,
            'limits' => ['orders' => 100, 'complaints' => 100, 'loyalty' => 100, 'referrals' => 100, 'contents' => 200],
            'has_demo_rows' => $orders->contains('is_demo', true) || $complaints->contains('is_demo', true) || $loyalty->contains('is_demo', true) || $referrals->contains('is_demo', true),
            'filters' => $filters,
        ]);
    }

    public function audit(Request $request)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        $filters = $request->validate(['restaurant_id' => ['nullable', Rule::exists('restaurants', 'id')]]);
        return DB::table('platform_audit_logs as log')
            ->leftJoin('users as actor', 'actor.id', '=', 'log.actor_id')
            ->select('log.*', 'actor.name as actor_name')
            ->when($filters['restaurant_id'] ?? null, fn ($query, $id) => $query->where('log.restaurant_id', $id))
            ->orderByDesc('log.id')->limit(100)->get();
    }
}
