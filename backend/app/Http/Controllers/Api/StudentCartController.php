<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Restaurant;
use App\Models\MenuOption;
use App\Support\StudentAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StudentCartController extends Controller
{
    public function show(Request $request)
    {
        StudentAccess::require($request);
        return Cart::where('user_id', $request->user()->id)->with('items')->first();
    }

    public function save(Request $request)
    {
        StudentAccess::require($request);
        $data = $request->validate([
            'restaurant_id' => ['required', 'string', 'exists:restaurants,id'],
            'replace_restaurant' => ['sometimes', 'boolean'],
            'expected_version' => ['nullable', 'integer', 'min:1'],
            'items' => ['required', 'array', 'min:1', 'max:30'],
            'items.*.content_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
            'items.*.variant_id' => ['nullable', 'integer'],
            'items.*.supplement_ids' => ['sometimes', 'array', 'max:10'],
            'items.*.supplement_ids.*' => ['integer', 'distinct'],
        ]);
        $restaurant = Restaurant::findOrFail($data['restaurant_id']);
        abort_unless($restaurant->status === 'active' && $restaurant->is_public, 404);
        $cart = DB::transaction(function () use ($request, $data, $restaurant) {
            // Le verrou utilisateur sérialise le changement de restaurant et la création de commande.
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $cart = Cart::where('user_id', $request->user()->id)->lockForUpdate()->first();
            if ($cart && $cart->restaurant_id !== $restaurant->id && !($data['replace_restaurant'] ?? false)) {
                abort(409, 'Le panier contient un autre restaurant. Confirmez son remplacement.');
            }
            if ($cart && ($data['expected_version'] ?? null) !== $cart->version) abort(409, 'Panier modifié. Rechargez-le.');
            $ids = collect($data['items'])->pluck('content_id')->unique();
            if ($restaurant->contents()->where('kind', 'dish')->whereIn('id', $ids)->count() !== $ids->count()) {
                throw ValidationException::withMessages(['items' => 'Un plat ne dépend pas de ce restaurant.']);
            }
            $selectedIds = collect($data['items'])->flatMap(fn ($item) => array_merge(
                isset($item['variant_id']) ? [$item['variant_id']] : [], $item['supplement_ids'] ?? []
            ))->unique()->all();
            $options = MenuOption::whereIn('id', $selectedIds)->get()->keyBy('id');
            foreach ($data['items'] as $item) {
                if (isset($item['variant_id']) && (!$options->has($item['variant_id']) || $options[$item['variant_id']]->content_id !== $item['content_id'] || $options[$item['variant_id']]->kind !== 'variant')) {
                    throw ValidationException::withMessages(['items' => 'Variante étrangère au plat.']);
                }
                foreach ($item['supplement_ids'] ?? [] as $id) {
                    if (!$options->has($id) || $options[$id]->content_id !== $item['content_id'] || $options[$id]->kind !== 'supplement') {
                        throw ValidationException::withMessages(['items' => 'Supplément étranger au plat.']);
                    }
                }
            }
            if (!$cart) $cart = Cart::create(['user_id' => $request->user()->id, 'restaurant_id' => $restaurant->id]);
            else $cart->update(['restaurant_id' => $restaurant->id, 'version' => $cart->version + 1]);
            $cart->items()->delete();
            foreach ($data['items'] as $item) $cart->items()->create([
                'content_id' => $item['content_id'], 'variant_id' => $item['variant_id'] ?? null,
                'supplement_ids' => $item['supplement_ids'] ?? [], 'quantity' => $item['quantity'],
            ]);
            return $cart;
        });
        return response()->json($cart->load('items'));
    }

    public function clear(Request $request)
    {
        StudentAccess::require($request);
        DB::transaction(function () use ($request) {
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            Cart::where('user_id', $request->user()->id)->delete();
        });
        return response()->noContent();
    }
}
