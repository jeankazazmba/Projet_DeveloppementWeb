<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Support\PlatformAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlatformRestaurantController extends Controller
{
    private function authorizePlatform(Request $request): void
    {
        abort_unless($request->user()->is_platform_admin, 403);
    }

    public function index(Request $request)
    {
        $this->authorizePlatform($request);
        return Restaurant::orderBy('name')->get();
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
        ]);
        $reason = $data['reason'] ?? null;
        unset($data['reason']);
        if (array_key_exists('status', $data)) {
            $data['is_public'] = $data['status'] === 'active';
        } elseif (array_key_exists('is_public', $data)) {
            $data['status'] = $data['is_public'] ? 'active' : ($restaurant->status === 'suspended' ? 'suspended' : 'draft');
        }
        if (($data['status'] ?? null) === 'suspended' && !$reason) {
            return response()->json(['message' => 'Un motif est obligatoire pour suspendre un restaurant.'], 422);
        }
        DB::transaction(function () use ($request, $restaurant, $data, $reason) {
            $before = $restaurant->only(array_keys($data));
            $restaurant->update($data);
            PlatformAudit::record($request->user(), 'restaurant.updated', 'restaurant', $restaurant->id, $restaurant->id, $reason, ['before' => $before, 'after' => $restaurant->only(array_keys($data))]);
        });
        return $restaurant->refresh();
    }
}
