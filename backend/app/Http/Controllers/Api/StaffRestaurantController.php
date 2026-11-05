<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use App\Support\RestaurantAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        if ($role === 'admin') return $restaurant->contents()->orderByDesc('updated_at')->get();
        return $restaurant->contents()->where('kind', 'dish')->where('is_published', true)
            ->orderBy('title')->get(['id', 'restaurant_id', 'kind', 'title', 'price_cdf', 'image_url', 'is_published', 'is_available', 'is_featured', 'version']);
    }

    public function store(Request $request, Restaurant $restaurant)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        $data = $this->validatedContent($request);
        return response()->json($restaurant->contents()->create($data), 201);
    }

    public function update(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        RestaurantAccess::require($request, $restaurant, ['admin']);
        abort_unless($content->restaurant_id === $restaurant->id, 404);
        $data = $this->validatedContent($request, true);
        $expectedVersion = $data['expected_version'] ?? null;
        unset($data['expected_version']);
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
        $content->delete();
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
        abort_if(!$data, 422, 'Indiquez une disponibilité ou un plat du jour.');
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
            'kind' => [$required, 'in:dish,promotion,event,game'],
            'title' => [$required, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_cdf' => ['nullable', 'integer', 'min:0'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'details' => ['nullable', 'array'],
            'is_published' => ['sometimes', 'boolean'],
            'expected_version' => [$partial ? 'sometimes' : 'prohibited', 'integer', 'min:1'],
        ]);
    }
}
