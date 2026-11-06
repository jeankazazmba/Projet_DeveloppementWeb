<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\BuildStatisticsExport;
use App\Models\Restaurant;
use App\Support\RestaurantAccess;
use App\Support\RestaurantStatistics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RestaurantStatisticsController extends Controller
{
    private function period(Request $request): array
    {
        return RestaurantStatistics::filters($request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'], 'to' => ['nullable', 'date_format:Y-m-d'],
        ]));
    }

    public function index(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        [$from, $to] = $this->period($request);
        return RestaurantStatistics::forRestaurant($restaurant, $from, $to);
    }

    public function export(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        [$from, $to] = $this->period($request);
        $id = DB::table('statistic_exports')->insertGetId([
            'user_id' => $request->user()->id, 'restaurant_id' => $restaurant->id,
            'scope' => 'restaurant', 'status' => 'pending', 'from_date' => $from->toDateString(),
            'to_date' => $to->toDateString(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        BuildStatisticsExport::dispatch($id)->afterCommit();
        return response()->json(['id' => $id, 'status' => 'pending'], 202);
    }

    private function authorizedExport(Request $request, int $export)
    {
        $row = DB::table('statistic_exports')->where('id', $export)->where('user_id', $request->user()->id)->first();
        abort_unless($row && $row->scope === 'restaurant', 404);
        $restaurant = Restaurant::findOrFail($row->restaurant_id);
        RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        return $row;
    }

    public function showExport(Request $request, int $export)
    {
        $row = $this->authorizedExport($request, $export);
        return ['id' => $row->id, 'restaurant_id' => $row->restaurant_id, 'status' => $row->status,
            'from' => $row->from_date, 'to' => $row->to_date];
    }

    public function download(Request $request, int $export)
    {
        $row = $this->authorizedExport($request, $export);
        abort_unless($row->status === 'ready' && $row->path && Storage::disk('local')->exists($row->path), 404);
        return response()->download(Storage::disk('local')->path($row->path), 'statistiques-'.$row->restaurant_id.'.csv');
    }
}
