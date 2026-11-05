<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use App\Models\DiningTable;
use App\Models\Restaurant;
use App\Support\RestaurantAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RestaurantOperationsController extends Controller
{
    public function publicTables(Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        return $restaurant->diningTables()->where('is_active', true)->orderBy('code')->get(['id', 'code', 'capacity']);
    }

    public function publicZones(Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        return $restaurant->deliveryZones()->where('is_active', true)->orderBy('district')->get(['id', 'district', 'fee_cdf']);
    }

    public function tables(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin', 'manager', 'employee']);
        return $restaurant->diningTables()->orderBy('code')->get();
    }

    public function zones(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        return $restaurant->deliveryZones()->orderBy('district')->get();
    }

    public function tableStore(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate(['code' => ['required', 'string', 'max:40', Rule::unique('dining_tables')->where('restaurant_id', $restaurant->id)], 'capacity' => ['required', 'integer', 'min:1', 'max:20'], 'is_active' => ['sometimes', 'boolean']]);
        return response()->json($restaurant->diningTables()->create($data), 201);
    }

    public function tableUpdate(Request $request, Restaurant $restaurant, DiningTable $table)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($table->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['code' => ['sometimes', 'required', 'string', 'max:40', Rule::unique('dining_tables')->where('restaurant_id', $restaurant->id)->ignore($table->id)], 'capacity' => ['sometimes', 'integer', 'min:1', 'max:20'], 'is_active' => ['sometimes', 'boolean'], 'expected_version' => ['required', 'integer', 'min:1']]);
        return $this->updateVersioned($table, $data);
    }

    public function tableDelete(Request $request, Restaurant $restaurant, DiningTable $table)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($table->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($table, $data) {
            $locked = DiningTable::whereKey($table->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            abort_if(DB::table('table_reservations')->where('dining_table_id', $locked->id)->exists(), 409, 'Désactivez cette table : elle a un historique de réservation.');
            $locked->delete();
        });
        return response()->noContent();
    }

    public function zoneStore(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate(['district' => ['required', 'string', 'max:120', Rule::unique('delivery_zones')->where('restaurant_id', $restaurant->id)], 'fee_cdf' => ['required', 'integer', 'min:0', 'max:100000000'], 'is_active' => ['sometimes', 'boolean']]);
        return response()->json($restaurant->deliveryZones()->create($data), 201);
    }

    public function zoneUpdate(Request $request, Restaurant $restaurant, DeliveryZone $zone)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($zone->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['district' => ['sometimes', 'required', 'string', 'max:120', Rule::unique('delivery_zones')->where('restaurant_id', $restaurant->id)->ignore($zone->id)], 'fee_cdf' => ['sometimes', 'integer', 'min:0', 'max:100000000'], 'is_active' => ['sometimes', 'boolean'], 'expected_version' => ['required', 'integer', 'min:1']]);
        return $this->updateVersioned($zone, $data);
    }

    public function zoneDelete(Request $request, Restaurant $restaurant, DeliveryZone $zone)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($zone->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($zone, $data) {
            $locked = DeliveryZone::whereKey($zone->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            abort_if(DB::table('orders')->where('delivery_zone_id', $locked->id)->exists(), 409, 'Désactivez cette zone : elle a un historique de livraison.');
            $locked->delete();
        });
        return response()->noContent();
    }

    private function updateVersioned($model, array $data)
    {
        $expected = $data['expected_version']; unset($data['expected_version']);
        abort_if(!$data, 422, 'Aucune modification fournie.');
        DB::transaction(function () use ($model, $data, $expected) {
            $locked = $model->newQuery()->whereKey($model->getKey())->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $expected, 409, 'Ressource modifiée. Rechargez-la.');
            $locked->update([...$data, 'version' => $locked->version + 1]);
        });
        return $model->refresh();
    }
}
