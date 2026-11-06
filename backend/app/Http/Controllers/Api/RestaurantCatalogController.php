<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class RestaurantCatalogController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'paginate' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = Restaurant::where('status', 'active')->where('is_public', true)
            ->when($filters['q'] ?? null, fn ($items, $q) => $items->where(fn ($search) => $search->where('name', 'like', "%{$q}%")->orWhere('location', 'like', "%{$q}%")))
            ->orderBy('name');
        if ($request->boolean('paginate')) return ApiResponse::paginated($query->paginate($filters['per_page'] ?? 25)->appends($request->query()));
        return $query->get();
    }

    public function show(Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        return $restaurant;
    }

    public function content(Restaurant $restaurant, Request $request)
    {
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        $kind = $request->validate(['kind' => ['sometimes', 'in:dish,promotion,event,game']])['kind'] ?? null;
        $query = $restaurant->contents()->publicActive()->with(['category:id,name', 'options' => fn ($q) => $q->where('is_available', true)->where(fn ($stock) => $stock->whereNull('stock_quantity')->orWhere('stock_quantity', '>', 0))->select('id', 'content_id', 'kind', 'name', 'price_delta_cdf'), 'allergens:id,name']);
        if ($kind) $query->where('kind', $kind);
        return $query->orderBy('id')->get()->each->makeHidden('stock_quantity');
    }

    public function menu(Restaurant $restaurant)
    {
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        return response()->json([
            'restaurant_id' => $restaurant->id,
            'currency' => 'CDF',
            'categories' => $restaurant->categories()->where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'sort_order']),
            'dishes' => $restaurant->contents()->publicActive()->where('kind', 'dish')
                ->with(['options' => fn ($q) => $q->where('is_available', true)->where(fn ($stock) => $stock->whereNull('stock_quantity')->orWhere('stock_quantity', '>', 0))->select('id', 'content_id', 'kind', 'name', 'price_delta_cdf'), 'allergens:id,name'])
                ->orderBy('title')->get()->each->makeHidden('stock_quantity'),
        ]);
    }
}
