<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use Illuminate\Http\Request;

class StaffRestaurantController extends Controller
{
    private function role(Request $request, Restaurant $restaurant): string
    {
        abort_if($request->user()->is_platform_admin, 403);
        $role = $request->user()->restaurants()->whereKey($restaurant->id)->first()?->pivot?->role;
        abort_unless($role, 404);
        return $role;
    }

    private function canWrite(Request $request, Restaurant $restaurant): void
    {
        abort_unless(in_array($this->role($request, $restaurant), ['admin', 'manager'], true), 403);
    }

    public function restaurants(Request $request)
    {
        abort_if($request->user()->is_platform_admin, 403);
        return $request->user()->restaurants()->orderBy('name')->get();
    }

    public function content(Request $request, Restaurant $restaurant)
    {
        $this->role($request, $restaurant);
        return $restaurant->contents()->orderByDesc('updated_at')->get();
    }

    public function store(Request $request, Restaurant $restaurant)
    {
        $this->canWrite($request, $restaurant);
        $data = $this->validatedContent($request);
        return response()->json($restaurant->contents()->create($data), 201);
    }

    public function update(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        $this->canWrite($request, $restaurant);
        abort_unless($content->restaurant_id === $restaurant->id, 404);
        $content->update($this->validatedContent($request, true));
        return $content->refresh();
    }

    public function destroy(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        $this->canWrite($request, $restaurant);
        abort_unless($content->restaurant_id === $restaurant->id, 404);
        $content->delete();
        return response()->noContent();
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
        ]);
    }
}
