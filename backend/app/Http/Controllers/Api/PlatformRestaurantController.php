<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class PlatformRestaurantController extends Controller
{
    private function authorizePlatform(Request $request): void
    {
        abort_unless($request->user()->is_platform_admin, 403);
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
            'is_public' => ['sometimes', 'boolean'],
        ]);
        return response()->json(Restaurant::create($data), 201);
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
        ]);
        $restaurant->update($data);
        return $restaurant->refresh();
    }
}
