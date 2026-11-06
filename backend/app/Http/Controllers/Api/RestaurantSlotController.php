<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\ServiceSlot;
use App\Support\RestaurantAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RestaurantSlotController extends Controller
{
    public function fee(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate(['delivery_fee_cdf' => ['required', 'integer', 'min:0', 'max:100000000'], 'expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($restaurant, $data) {
            $locked = Restaurant::whereKey($restaurant->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            $locked->update(['delivery_fee_cdf' => $data['delivery_fee_cdf'], 'version' => $locked->version + 1]);
        });
        return $restaurant->refresh()->only(['id', 'delivery_fee_cdf', 'version']);
    }

    public function publicIndex(Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        return $restaurant->serviceSlots()->where('is_active', true)->orderBy('weekday')->orderBy('starts_at')->get();
    }

    public function index(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        return $restaurant->serviceSlots()->orderBy('weekday')->orderBy('starts_at')->get();
    }

    public function store(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate($this->rules());
        $this->validateHours($data);
        return response()->json($restaurant->serviceSlots()->create($data), 201);
    }

    public function update(Request $request, Restaurant $restaurant, ServiceSlot $slot)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($slot->restaurant_id === $restaurant->id, 404);
        $data = $request->validate([...$this->rules('sometimes'), 'expected_version' => ['required', 'integer', 'min:1']]);
        $this->validateHours($data, $slot);
        $expected = $data['expected_version']; unset($data['expected_version']);
        DB::transaction(function () use ($slot, $data, $expected) {
            $locked = ServiceSlot::whereKey($slot->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $expected, 409);
            $locked->update([...$data, 'version' => $locked->version + 1]);
        });
        return $slot->refresh();
    }

    public function destroy(Request $request, Restaurant $restaurant, ServiceSlot $slot)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($slot->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($slot, $data) {
            $locked = ServiceSlot::whereKey($slot->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            $locked->delete();
        });
        return response()->noContent();
    }

    private function rules(string $presence = 'required'): array
    {
        return [
            'service' => [$presence, Rule::in(['pickup', 'dine_in', 'delivery'])],
            'weekday' => [$presence, 'integer', 'between:0,6'],
            'starts_at' => [$presence, 'date_format:H:i'],
            'ends_at' => [$presence, 'date_format:H:i'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    private function validateHours(array $data, ?ServiceSlot $slot = null): void
    {
        $start = $data['starts_at'] ?? $slot?->starts_at;
        $end = $data['ends_at'] ?? $slot?->ends_at;
        if (substr($start, 0, 5) >= substr($end, 0, 5)) throw ValidationException::withMessages(['ends_at' => 'La fin doit suivre le début, le même jour.']);
    }
}
