<?php

namespace App\Jobs;

use App\Models\Restaurant;
use App\Models\User;
use App\Support\RestaurantStatistics;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BuildStatisticsExport implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public int $exportId) { $this->onQueue('exports'); }

    public function handle(): void
    {
        $export = DB::table('statistic_exports')->where('id', $this->exportId)->first();
        if (!$export || $export->status !== 'pending') return;
        $user = User::find($export->user_id);
        $restaurant = Restaurant::find($export->restaurant_id);
        if (!$user?->is_active || $user->is_platform_admin || !$restaurant || !$user->restaurants()
            ->whereKey($restaurant->id)->wherePivot('is_active', true)->wherePivotIn('role', ['admin', 'manager'])->exists()) {
            DB::table('statistic_exports')->where('id', $this->exportId)->update(['status' => 'failed', 'updated_at' => now()]);
            return;
        }
        $stats = RestaurantStatistics::forRestaurant($restaurant,
            Carbon::parse($export->from_date, 'Africa/Kinshasa')->startOfDay(),
            Carbon::parse($export->to_date, 'Africa/Kinshasa')->endOfDay());
        $stream = fopen('php://temp', 'w+');
        fputcsv($stream, ['restaurant_id', 'day', 'confirmed_orders', 'volume_cdf']);
        foreach ($stats['orders']['daily'] as $row) fputcsv($stream, [$restaurant->id, $row->day, $row->orders, $row->volume_cdf]);
        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);
        $path = 'exports/statistics-'.$this->exportId.'.csv';
        Storage::disk('local')->put($path, $csv);
        DB::table('statistic_exports')->where('id', $this->exportId)->where('status', 'pending')
            ->update(['status' => 'ready', 'path' => $path, 'updated_at' => now()]);
    }
}
