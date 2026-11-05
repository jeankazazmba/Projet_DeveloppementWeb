<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use App\Support\RestaurantAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StaffRestaurantController extends Controller
{
    public function restaurants(Request $request)
    {
        abort_if(!$request->user()->is_active || $request->user()->is_platform_admin, 403);
        return $request->user()->restaurants()->wherePivot('is_active', true)->orderBy('name')->get();
    }

    public function content(Request $request, Restaurant $restaurant)
    {
        $role = RestaurantAccess::role($request, $restaurant);
        if ($role === 'admin') return $restaurant->contents()->with(['category', 'options', 'allergens'])->orderByDesc('updated_at')->get();
        if ($role === 'employee') return $restaurant->contents()->where('kind', 'dish')->where('is_published', true)
            ->orderBy('title')->get(['id', 'restaurant_id', 'kind', 'title', 'price_cdf', 'image_url', 'is_published', 'is_available', 'is_featured', 'version']);
        return $restaurant->contents()->where('kind', 'dish')->publicActive()
            ->orderBy('title')->get(['id', 'restaurant_id', 'kind', 'title', 'price_cdf', 'image_url', 'is_published', 'is_available', 'is_featured', 'version']);
    }

    public function store(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $this->validatedContent($request);
        $this->validateMenuFields($restaurant, $data);
        if ($data['kind'] === 'dish' && !isset($data['price_cdf'])) throw ValidationException::withMessages(['price_cdf' => 'Prix obligatoire pour un plat.']);
        return response()->json($restaurant->contents()->create($data), 201);
    }

    public function update(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($content->restaurant_id === $restaurant->id, 404);
        $data = $this->validatedContent($request, true);
        $this->validateMenuFields($restaurant, $data, $content);
        $expectedVersion = $data['expected_version'] ?? null;
        unset($data['expected_version']);
        abort_if(!$data, 422, 'Aucune modification fournie.');
        DB::transaction(function () use ($content, $data, $expectedVersion) {
            $locked = RestaurantContent::whereKey($content->id)->lockForUpdate()->firstOrFail();
            abort_if($expectedVersion !== null && $locked->version !== $expectedVersion, 409, 'Ce contenu a été modifié. Rechargez-le avant de réessayer.');
            $locked->update([...$data, 'version' => $locked->version + 1]);
        });
        return $content->refresh();
    }

    public function destroy(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($content->restaurant_id === $restaurant->id, 404);
        $data = $request->validate(['expected_version' => ['nullable', 'integer', 'min:1']]);
        DB::transaction(function () use ($content, $data) {
            $locked = RestaurantContent::whereKey($content->id)->lockForUpdate()->firstOrFail();
            abort_if(isset($data['expected_version']) && $locked->version !== $data['expected_version'], 409, 'Ce contenu a été modifié. Rechargez-le avant de réessayer.');
            $locked->delete();
        });
        return response()->noContent();
    }

    public function service(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        RestaurantAccess::require($request, $restaurant, ['admin', 'employee']);
        abort_unless($content->restaurant_id === $restaurant->id && $content->kind === 'dish' && $content->is_published, 404);
        $data = $request->validate([
            'is_available' => ['sometimes', 'required', 'boolean'],
            'is_featured' => ['sometimes', 'required', 'boolean'],
            'expected_version' => ['nullable', 'integer', 'min:1'],
        ]);
        abort_if(!array_key_exists('is_available', $data) && !array_key_exists('is_featured', $data), 422, 'Indiquez une disponibilité ou un plat du jour.');
        DB::transaction(function () use ($restaurant, $content, $data) {
            Restaurant::whereKey($restaurant->id)->lockForUpdate()->firstOrFail();
            $content = RestaurantContent::whereKey($content->id)->lockForUpdate()->firstOrFail();
            abort_unless($content->is_published, 404);
            abort_if(isset($data['expected_version']) && $content->version !== $data['expected_version'], 409, 'Ce contenu a été modifié. Rechargez-le avant de réessayer.');
            unset($data['expected_version']);
            abort_if(($data['is_featured'] ?? false) && ($data['is_available'] ?? $content->is_available) === false, 422, 'Un plat indisponible ne peut pas être le plat du jour.');
            if ($data['is_featured'] ?? false) {
                $restaurant->contents()->where('kind', 'dish')->where('id', '!=', $content->id)->where('is_featured', true)
                    ->update(['is_featured' => false, 'version' => DB::raw('version + 1')]);
            }
            if (($data['is_available'] ?? true) === false) $data['is_featured'] = false;
            $content->update([...$data, 'version' => $content->version + 1]);
        });
        return $content->refresh()->only(['id', 'restaurant_id', 'kind', 'title', 'price_cdf', 'image_url', 'is_published', 'is_available', 'is_featured', 'version']);
    }

    private function validatedContent(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'kind' => [$partial ? 'prohibited' : 'required', 'in:dish,promotion,event,game'],
            'title' => [$required, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_cdf' => ['nullable', 'integer', 'min:0', 'max:1000000000'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'details' => ['nullable', 'array'],
            'is_published' => ['sometimes', 'boolean'],
            'is_available' => ['sometimes', 'boolean'],
            'category_id' => ['nullable', 'integer'],
            'stock_quantity' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'published_from' => ['nullable', 'date'],
            'published_until' => ['nullable', 'date'],
            'expected_version' => [$partial ? 'sometimes' : 'prohibited', 'integer', 'min:1'],
        ]);
    }

    private function validateMenuFields(Restaurant $restaurant, array $data, ?RestaurantContent $existing = null): void
    {
        $kind = $existing?->kind ?? $data['kind'];
        if (isset($data['category_id'])) {
            if ($kind !== 'dish' || !$restaurant->categories()->whereKey($data['category_id'])->exists()) {
                throw ValidationException::withMessages(['category_id' => 'Catégorie invalide pour ce restaurant.']);
            }
        }
        if ($kind !== 'dish' && array_key_exists('stock_quantity', $data) && $data['stock_quantity'] !== null) {
            throw ValidationException::withMessages(['stock_quantity' => 'Stock réservé aux plats.']);
        }
        $from = array_key_exists('published_from', $data) ? $data['published_from'] : $existing?->published_from;
        $until = array_key_exists('published_until', $data) ? $data['published_until'] : $existing?->published_until;
        if ($from && $until && \Illuminate\Support\Carbon::parse($until)->lessThanOrEqualTo(\Illuminate\Support\Carbon::parse($from))) {
            throw ValidationException::withMessages(['published_until' => 'La fin doit suivre le début de publication.']);
        }
    }
}
