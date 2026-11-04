<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\RestaurantContent;
use App\Support\PlatformAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffRestaurantController extends Controller
{
    private function role(Request $request, Restaurant $restaurant): string
    {
        if ($request->user()->is_platform_admin) return 'platform';
        $role = $request->user()->restaurants()->whereKey($restaurant->id)->first()?->pivot?->role;
        abort_unless($role, 404);
        return $role;
    }

    private function canWrite(Request $request, Restaurant $restaurant): void
    {
        abort_unless(in_array($this->role($request, $restaurant), ['platform', 'admin', 'manager'], true), 403);
    }

    public function restaurants(Request $request)
    {
        return $request->user()->is_platform_admin
            ? Restaurant::orderBy('name')->get()
            : $request->user()->restaurants()->orderBy('name')->get();
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
        $content = DB::transaction(function () use ($request, $restaurant, $data) {
            $content = $restaurant->contents()->create($data);
            if ($request->user()->is_platform_admin) {
                PlatformAudit::record($request->user(), 'content.created', 'content', (string) $content->id, $restaurant->id);
            }
            return $content;
        });
        return response()->json($content, 201);
    }

    public function update(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        $this->canWrite($request, $restaurant);
        abort_unless($content->restaurant_id === $restaurant->id, 404);
        $data = $this->validatedContent($request, true);
        DB::transaction(function () use ($request, $restaurant, $content, $data) {
            $before = $content->only(array_keys($data));
            $content->update($data);
            if ($request->user()->is_platform_admin) {
                PlatformAudit::record($request->user(), 'content.updated', 'content', (string) $content->id, $restaurant->id, null, ['before' => $before, 'after' => $content->only(array_keys($data))]);
            }
        });
        return $content->refresh();
    }

    public function destroy(Request $request, Restaurant $restaurant, RestaurantContent $content)
    {
        $this->canWrite($request, $restaurant);
        abort_unless($content->restaurant_id === $restaurant->id, 404);
        DB::transaction(function () use ($request, $restaurant, $content) {
            $content->delete();
            if ($request->user()->is_platform_admin) {
                PlatformAudit::record($request->user(), 'content.deleted', 'content', (string) $content->id, $restaurant->id);
            }
        });
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
