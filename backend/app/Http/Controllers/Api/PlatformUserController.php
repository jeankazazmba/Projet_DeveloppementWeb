<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use App\Support\PlatformAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlatformUserController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        return User::query()
            ->where(fn ($query) => $query->where('is_platform_admin', true)
                ->orWhereHas('restaurants', fn ($restaurants) => $restaurants->where('restaurant_user.role', 'admin')))
            ->with(['restaurants' => fn ($query) => $query->where('restaurant_user.role', 'admin')->select('restaurants.id', 'restaurants.name')])
            ->orderBy('name')->get(['id', 'name', 'email', 'is_active', 'is_platform_admin', 'created_at']);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12'],
            'restaurant_id' => ['required', Rule::exists('restaurants', 'id')],
            'role' => ['required', Rule::in(['admin'])],
        ]);
        $user = DB::transaction(function () use ($request, $data) {
            $created = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
            $created->restaurants()->attach($data['restaurant_id'], ['role' => $data['role']]);
            PlatformAudit::record($request->user(), 'user.created', 'user', (string) $created->id, $data['restaurant_id'], null, ['role' => $data['role']]);
            return $created;
        });
        return response()->json($user->load(['restaurants' => fn ($query) => $query->where('restaurant_user.role', 'admin')->select('restaurants.id', 'restaurants.name')]), 201);
    }

    public function assign(Request $request, Restaurant $restaurant, User $user)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        abort_unless($user->is_platform_admin || $user->restaurants()->wherePivot('role', 'admin')->exists(), 404);
        $data = $request->validate(['role' => ['required', Rule::in(['admin'])]]);
        DB::transaction(function () use ($request, $restaurant, $user, $data) {
            $previous = $user->restaurants()->whereKey($restaurant->id)->first()?->pivot?->role;
            $user->restaurants()->syncWithoutDetaching([$restaurant->id => ['role' => $data['role']]]);
            PlatformAudit::record($request->user(), 'assignment.saved', 'user', (string) $user->id, $restaurant->id, null, ['before' => $previous, 'after' => $data['role']]);
        });
        return $user->load(['restaurants' => fn ($query) => $query->where('restaurant_user.role', 'admin')->select('restaurants.id', 'restaurants.name')]);
    }

    public function revoke(Request $request, Restaurant $restaurant, User $user)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        abort_unless($user->restaurants()->whereKey($restaurant->id)->wherePivot('role', 'admin')->exists(), 404);
        DB::transaction(function () use ($request, $restaurant, $user) {
            $user->restaurants()->detach($restaurant->id);
            PlatformAudit::record($request->user(), 'assignment.revoked', 'user', (string) $user->id, $restaurant->id);
        });
        return response()->noContent();
    }

    public function update(Request $request, User $user)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        abort_unless($user->is_platform_admin || $user->restaurants()->wherePivot('role', 'admin')->exists(), 404);
        $data = $request->validate(['is_active' => ['required', 'boolean'], 'reason' => ['nullable', 'string', 'max:1000']]);
        abort_if($user->id === $request->user()->id && !$data['is_active'], 422, 'Vous ne pouvez pas suspendre votre propre compte.');
        if (!$data['is_active'] && empty($data['reason'])) return response()->json(['message' => 'Un motif est obligatoire pour suspendre un compte.'], 422);
        DB::transaction(function () use ($request, $user, $data) {
            $previous = $user->is_active;
            $user->update(['is_active' => $data['is_active']]);
            if (!$data['is_active']) $user->tokens()->delete();
            PlatformAudit::record($request->user(), 'user.status_changed', 'user', (string) $user->id, null, $data['reason'] ?? null, ['before' => $previous, 'after' => $data['is_active']]);
        });
        return $user->refresh()->load(['restaurants' => fn ($query) => $query->where('restaurant_user.role', 'admin')->select('restaurants.id', 'restaurants.name')]);
    }
}
