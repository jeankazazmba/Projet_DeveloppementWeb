<?php

namespace App\Support;

use App\Models\Restaurant;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RestaurantStatistics
{
    public const CONFIRMED = ['accepted', 'preparing', 'ready', 'served', 'delivering', 'delivered', 'paid'];

    public static function filters(array $data): array
    {
        $from = isset($data['from']) ? Carbon::parse($data['from'], 'Africa/Kinshasa')->startOfDay() : Carbon::now('Africa/Kinshasa')->subDays(29)->startOfDay();
        $to = isset($data['to']) ? Carbon::parse($data['to'], 'Africa/Kinshasa')->endOfDay() : Carbon::now('Africa/Kinshasa')->endOfDay();
        if ($to->lt($from) || $from->diffInDays($to) > 366) {
            throw ValidationException::withMessages(['to' => 'Période invalide ou supérieure à 366 jours.']);
        }
        return [$from, $to];
    }

    public static function forRestaurant(Restaurant $restaurant, Carbon $from, Carbon $to): array
    {
        $orders = fn () => DB::table('orders')->where('restaurant_id', $restaurant->id)
            ->whereIn('status', self::CONFIRMED)->whereBetween('created_at', [$from->copy()->utc(), $to->copy()->utc()]);
        $totals = $orders()->selectRaw('COUNT(*) as orders, COALESCE(SUM(amount_cdf), 0) as volume_cdf')->first();
        $byStatus = $orders()->selectRaw('status, COUNT(*) as orders')->groupBy('status')->pluck('orders', 'status');
        $byService = $orders()->selectRaw('service, COUNT(*) as orders, COALESCE(SUM(amount_cdf), 0) as volume_cdf')
            ->groupBy('service')->get();
        $topDishes = DB::table('order_lines as line')->join('orders as o', 'o.id', '=', 'line.order_id')
            ->where('o.restaurant_id', $restaurant->id)->whereIn('o.status', self::CONFIRMED)
            ->whereBetween('o.created_at', [$from->copy()->utc(), $to->copy()->utc()])
            ->selectRaw('line.title_snapshot as title, SUM(line.quantity) as quantity, SUM(line.line_total_cdf) as volume_cdf')
            ->groupBy('line.title_snapshot')->orderByDesc('quantity')->limit(10)->get();
        $localDay = DB::getDriverName() === 'sqlite' ? "DATE(datetime(created_at, '+1 hour'))" : 'DATE(DATE_ADD(created_at, INTERVAL 1 HOUR))';
        $daily = $orders()->selectRaw("{$localDay} as day, COUNT(*) as orders, SUM(amount_cdf) as volume_cdf")
            ->groupBy(DB::raw($localDay))->orderBy('day')->get();
        $loyalty = DB::table('loyalty_movements')->where('restaurant_id', $restaurant->id)
            ->whereBetween('created_at', [$from->copy()->utc(), $to->copy()->utc()])
            ->selectRaw('COALESCE(SUM(CASE WHEN points > 0 THEN points ELSE 0 END), 0) as issued, COALESCE(SUM(CASE WHEN points < 0 THEN -points ELSE 0 END), 0) as used')->first();
        $referrals = DB::table('referrals')->where('restaurant_id', $restaurant->id)
            ->whereBetween('created_at', [$from->copy()->utc(), $to->copy()->utc()])
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN status = 'rewarded' THEN 1 ELSE 0 END) as rewarded")->first();
        return [
            'restaurant_id' => $restaurant->id, 'currency' => 'CDF',
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString(), 'timezone' => 'Africa/Kinshasa'],
            'orders' => ['confirmed' => (int) $totals->orders, 'volume_cdf' => (int) $totals->volume_cdf,
                'by_status' => $byStatus, 'by_service' => $byService, 'daily' => $daily, 'top_dishes' => $topDishes],
            'loyalty' => ['points_issued' => (int) $loyalty->issued, 'points_used' => (int) $loyalty->used],
            'referrals' => ['total' => (int) $referrals->total, 'rewarded' => (int) $referrals->rewarded],
        ];
    }
}
