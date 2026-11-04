<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantCatalogController extends Controller
{
    public function index()
    {
        return Restaurant::where('is_public', true)->orderBy('name')->get();
    }

    public function show(Restaurant $restaurant)
    {
        abort_unless($restaurant->is_public, 404);
        return $restaurant;
    }

    public function content(Restaurant $restaurant, Request $request)
    {
        abort_unless($restaurant->is_public, 404);
        $kind = $request->validate(['kind' => ['sometimes', 'in:dish,promotion,event,game']])['kind'] ?? null;
        $query = $restaurant->contents()->where('is_published', true);
        if ($kind) $query->where('kind', $kind);
        return $query->orderBy('id')->get();
    }
}
