<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class HealthController extends Controller
{
    public function live()
    {
        return response()->json(['status' => 'ok', 'application' => 'Mon Miam Miam', 'service' => 'backend']);
    }

    public function ready()
    {
        try {
            DB::select('SELECT 1');
            $ready = Schema::hasTable('migrations') && Schema::hasTable('restaurants')
                && (config('queue.default') !== 'database' || Schema::hasTable('jobs'));
        } catch (\Throwable) {
            $ready = false;
        }

        return response()->json(['status' => $ready ? 'ready' : 'unavailable', 'service' => 'backend'], $ready ? 200 : 503)
            ->header('Cache-Control', 'no-store');
    }
}
