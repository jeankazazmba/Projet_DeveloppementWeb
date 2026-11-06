<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuAllergen;
use App\Models\MenuCategory;
use App\Models\MenuOption;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use App\Support\RestaurantAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RestaurantMenuController extends Controller
{
    public function categories(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        return $restaurant->categories()->orderBy('sort_order')->get();
    }

    public function categoryStore(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535'], 'is_active' => ['sometimes', 'boolean']]);
        return response()->json($restaurant->categories()->create($data), 201);
    }

    public function categoryUpdate(Request $request, Restaurant $restaurant, MenuCategory $category)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($category->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['name' => ['sometimes', 'required', 'string', 'max:255'], 'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535'], 'is_active' => ['sometimes', 'boolean'], 'expected_version' => ['required', 'integer', 'min:1']]);
        $expected = $data['expected_version']; unset($data['expected_version']);
        DB::transaction(function () use ($category, $data, $expected) {
            $locked = MenuCategory::whereKey($category->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $expected, 409, 'Catégorie modifiée. Rechargez-la.');
            $locked->update([...$data, 'version' => $locked->version + 1]);
        });
        return $category->refresh();
    }

    public function categoryDelete(Request $request, Restaurant $restaurant, MenuCategory $category)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($category->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($category, $data) {
            $locked = MenuCategory::whereKey($category->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            $locked->delete();
        });
        return response()->noContent();
    }

    public function optionStore(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        $this->dish($request, $restaurant, $content);
        $data = $request->validate($this->optionRules());
        return response()->json($content->options()->create($data), 201);
    }

    public function optionUpdate(Request $request, Restaurant $restaurant, RestaurantContent $content, MenuOption $option)
    {
        $this->dish($request, $restaurant, $content);
        abort_unless($option->content_id === $content->id, 404);
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'price_delta_cdf' => ['sometimes', 'integer', 'min:0', 'max:1000000000'],
            'is_available' => ['sometimes', 'boolean'],
            'stock_quantity' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'expected_version' => ['required', 'integer', 'min:1'],
        ]);
        $expected = $data['expected_version']; unset($data['expected_version']);
        DB::transaction(function () use ($option, $data, $expected) {
            $locked = MenuOption::whereKey($option->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $expected, 409, 'Option modifiée. Rechargez-la.');
            $locked->update([...$data, 'version' => $locked->version + 1]);
        });
        return $option->refresh();
    }

    public function optionDelete(Request $request, Restaurant $restaurant, RestaurantContent $content, MenuOption $option)
    {
        $this->dish($request, $restaurant, $content);
        abort_unless($option->content_id === $content->id, 404);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($option, $data) {
            $locked = MenuOption::whereKey($option->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            $locked->delete();
        });
        return response()->noContent();
    }

    public function allergens(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        return MenuAllergen::where('restaurant_id', $restaurant->id)->orderBy('name')->get();
    }

    public function allergenStore(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $request->validate(['name' => ['required', 'string', 'max:100', Rule::unique('menu_allergens')->where('restaurant_id', $restaurant->id)]]);
        return response()->json(MenuAllergen::create(['restaurant_id' => $restaurant->id, ...$data]), 201);
    }

    public function allergenUpdate(Request $request, Restaurant $restaurant, MenuAllergen $allergen)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($allergen->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['name' => ['required', 'string', 'max:100', Rule::unique('menu_allergens')->where('restaurant_id', $restaurant->id)->ignore($allergen->id)], 'expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($allergen, $data) {
            $locked = MenuAllergen::whereKey($allergen->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            $locked->update(['name' => $data['name'], 'version' => $locked->version + 1]);
        });
        return $allergen->refresh();
    }

    public function allergenDelete(Request $request, Restaurant $restaurant, MenuAllergen $allergen)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($allergen->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['expected_version' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($allergen, $data) {
            $locked = MenuAllergen::whereKey($allergen->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            $locked->delete();
        });
        return response()->noContent();
    }

    public function setAllergens(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        $this->dish($request, $restaurant, $content);
        $data = $request->validate(['allergen_ids' => ['required', 'array', 'max:30'], 'allergen_ids.*' => ['integer', 'distinct'], 'expected_version' => ['required', 'integer', 'min:1']]);
        $ids = $data['allergen_ids'];
        if (MenuAllergen::where('restaurant_id', $restaurant->id)->whereIn('id', $ids)->count() !== count($ids)) {
            throw ValidationException::withMessages(['allergen_ids' => 'Allergène étranger au restaurant.']);
        }
        DB::transaction(function () use ($content, $ids, $data) {
            $locked = RestaurantContent::whereKey($content->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->version !== $data['expected_version'], 409);
            $locked->allergens()->sync($ids);
            $locked->update(['version' => $locked->version + 1]);
        });
        return $content->refresh()->load('allergens');
    }

    private function dish(Request $request, Restaurant $restaurant, RestaurantContent $content): void
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($content->restaurant_id === $restaurant->id && $content->kind === 'dish', 404);
    }

    private function optionRules(): array
    {
        return [
            'kind' => ['required', Rule::in(['variant', 'supplement'])],
            'name' => ['required', 'string', 'max:255'],
            'price_delta_cdf' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'is_available' => ['sometimes', 'boolean'],
            'stock_quantity' => ['nullable', 'integer', 'min:0', 'max:1000000'],
        ];
    }
}
