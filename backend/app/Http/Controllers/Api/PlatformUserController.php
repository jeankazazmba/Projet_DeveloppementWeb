<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use App\Support\PlatformAudit;
use App\Support\PlatformAccess;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlatformUserController extends Controller
{
    public function index(Request $request)
    {
        PlatformAccess::requireActiveAdmin($request);
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'active' => ['nullable', 'boolean'],
            'paginate' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = User::query()
            ->where(fn ($query) => $query->where('is_platform_admin', true)
                ->orWhereHas('restaurants', fn ($restaurants) => $restaurants->where('restaurant_user.role', 'admin')))
            ->with(['restaurants' => fn ($query) => $query->where('restaurant_user.role', 'admin')->select('restaurants.id', 'restaurants.name')])
            ->when($filters['q'] ?? null, fn ($items, $q) => $items->where(fn ($search) => $search->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%")))
            ->when(array_key_exists('active', $filters), fn ($items) => $items->where('is_active', $filters['active']))
            ->orderBy('name');
        if ($request->boolean('paginate')) return ApiResponse::paginated($query->paginate($filters['per_page'] ?? 25)->appends($request->query()));
        return $query->get(['id', 'name', 'email', 'is_active', 'is_platform_admin', 'version', 'created_at']);
    }

    public function store(Request $request)
    {
        PlatformAccess::requireActiveAdmin($request);
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
        PlatformAccess::requireActiveAdmin($request);
        abort_unless(!$user->is_platform_admin && $user->restaurants()->wherePivot('role', 'admin')->exists(), 404);
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
        PlatformAccess::requireActiveAdmin($request);
        abort_unless($user->restaurants()->whereKey($restaurant->id)->wherePivot('role', 'admin')->exists(), 404);
        DB::transaction(function () use ($request, $restaurant, $user) {
            $user->restaurants()->detach($restaurant->id);
            PlatformAudit::record($request->user(), 'assignment.revoked', 'user', (string) $user->id, $restaurant->id);
        });
        return response()->noContent();
    }

    public function update(Request $request, User $user)
    {
        PlatformAccess::requireActiveAdmin($request);
        abort_unless($user->is_platform_admin || $user->restaurants()->wherePivot('role', 'admin')->exists(), 404);
        $data = $request->validate(['is_active' => ['required', 'boolean'], 'reason' => ['nullable', 'string', 'max:1000'], 'expected_version' => ['nullable', 'integer', 'min:1']]);
        abort_if($user->id === $request->user()->id && !$data['is_active'], 422, 'Vous ne pouvez pas suspendre votre propre compte.');
        abort_if($user->is_platform_admin && !$data['is_active'] && User::where('is_platform_admin', true)->where('is_active', true)->count() <= 1, 422, 'Le dernier administrateur plateforme actif ne peut pas être suspendu.');
        if (!$data['is_active'] && empty($data['reason'])) return response()->json(['message' => 'Un motif est obligatoire pour suspendre un compte.'], 422);
        DB::transaction(function () use ($request, $user, $data) {
            $locked = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            abort_if(isset($data['expected_version']) && $locked->version !== $data['expected_version'], 409, 'Ce compte a été modifié. Rechargez-le avant de réessayer.');
            $previous = $locked->is_active;
            $locked->update(['is_active' => $data['is_active'], 'version' => $locked->version + 1]);
            if (!$data['is_active']) $locked->tokens()->delete();
            PlatformAudit::record($request->user(), 'user.status_changed', 'user', (string) $locked->id, null, $data['reason'] ?? null, ['before' => $previous, 'after' => $data['is_active']]);
        });
        return $user->refresh()->load(['restaurants' => fn ($query) => $query->where('restaurant_user.role', 'admin')->select('restaurants.id', 'restaurants.name')]);
    }
}
