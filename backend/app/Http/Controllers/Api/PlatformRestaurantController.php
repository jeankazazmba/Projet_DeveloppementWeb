<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Support\PlatformAudit;
use App\Support\PlatformAccess;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlatformRestaurantController extends Controller
{
    private function authorizePlatform(Request $request): void
    {
        PlatformAccess::requireActiveAdmin($request);
    }

    public function index(Request $request)
    {
        $this->authorizePlatform($request);
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'suspended'])],
            'paginate' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = Restaurant::query()
            ->when($filters['q'] ?? null, fn ($items, $q) => $items->where(fn ($search) => $search->where('name', 'like', "%{$q}%")->orWhere('location', 'like', "%{$q}%")))
            ->when($filters['status'] ?? null, fn ($items, $status) => $items->where('status', $status))
            ->orderBy('name');
        if ($request->boolean('paginate')) return ApiResponse::paginated($query->paginate($filters['per_page'] ?? 25)->appends($request->query()));
        return $query->get();
    }

    public function store(Request $request)
    {
        $this->authorizePlatform($request);
        $data = $request->validate([
            'id' => ['required', 'alpha_dash', 'max:80', 'unique:restaurants,id'],
            'name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'hours' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_demo' => ['sometimes', 'boolean'],
        ]);
        $restaurant = DB::transaction(function () use ($request, $data) {
            $restaurant = Restaurant::create([...$data, 'status' => 'draft', 'is_public' => false]);
            PlatformAudit::record($request->user(), 'restaurant.created', 'restaurant', $restaurant->id, $restaurant->id, null, ['name' => $restaurant->name]);
            return $restaurant;
        });
        return response()->json($restaurant, 201);
    }

    public function update(Request $request, Restaurant $restaurant)
    {
        $this->authorizePlatform($request);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'hours' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_public' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['draft', 'active', 'suspended'])],
            'reason' => ['nullable', 'string', 'max:1000'],
            'expected_version' => ['nullable', 'integer', 'min:1'],
        ]);
        $reason = $data['reason'] ?? null;
        $expectedVersion = $data['expected_version'] ?? null;
        unset($data['reason'], $data['expected_version']);
        if (array_key_exists('status', $data)) {
            $data['is_public'] = $data['status'] === 'active';
        } elseif (array_key_exists('is_public', $data)) {
            $data['status'] = $data['is_public'] ? 'active' : ($restaurant->status === 'suspended' ? 'suspended' : 'draft');
        }
        if (($data['status'] ?? null) === 'suspended' && !$reason) {
            return response()->json(['message' => 'Un motif est obligatoire pour suspendre un restaurant.'], 422);
        }
        DB::transaction(function () use ($request, $restaurant, $data, $reason, $expectedVersion) {
            $locked = Restaurant::whereKey($restaurant->id)->lockForUpdate()->firstOrFail();
            abort_if($expectedVersion !== null && $locked->version !== $expectedVersion, 409, 'Cette fiche restaurant a été modifiée. Rechargez-la avant de réessayer.');
            $before = $locked->only(array_keys($data));
            $locked->update([...$data, 'version' => $locked->version + 1]);
            PlatformAudit::record($request->user(), 'restaurant.updated', 'restaurant', $locked->id, $locked->id, $reason, ['before' => $before, 'after' => $locked->only(array_keys($data))]);
        });
        return $restaurant->refresh();
    }
}
