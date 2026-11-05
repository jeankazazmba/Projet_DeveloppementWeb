<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use App\Support\RestaurantAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RestaurantTeamController extends Controller
{
    public function index(Request $request, Restaurant $restaurant)
    {
        $actorRole = RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        $filters = $request->validate([
            'role' => ['nullable', Rule::in(['manager', 'employee'])],
            'active' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $members = $restaurant->users()->wherePivotIn('role', $actorRole === 'manager' ? ['employee'] : ['manager', 'employee'])
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->wherePivot('role', $role))
            ->when(array_key_exists('active', $filters), fn ($query) => $query->wherePivot('is_active', $filters['active']))
            ->orderBy('users.name')->paginate($filters['per_page'] ?? 25);
        return response()->json($members->through(fn ($member) => $this->member($member)));
    }

    public function store(Request $request, Restaurant $restaurant)
    {
        $actorRole = RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
            'role' => ['required', Rule::in(['manager', 'employee'])],
        ]);
        abort_if($actorRole === 'manager' && $data['role'] !== 'employee', 403);
        $user = DB::transaction(function () use ($request, $restaurant, $data) {
            $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
            $user->restaurants()->attach($restaurant->id, ['role' => $data['role']]);
            $this->audit($restaurant, $request->user(), $user, 'created', $data['role']);
            return $user;
        });
        return response()->json($this->member($restaurant->users()->whereKey($user->id)->first()), 201);
    }

    public function assign(Request $request, Restaurant $restaurant, User $user)
    {
        $actorRole = RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        $data = $request->validate(['role' => ['required', Rule::in(['manager', 'employee'])]]);
        abort_if($actorRole === 'manager' && $data['role'] !== 'employee', 403);
        abort_if($user->is_platform_admin || $user->studentProfile()->exists() || !$user->is_active || $user->id === $request->user()->id, 403);
        DB::transaction(function () use ($request, $restaurant, $user, $data, $actorRole) {
            $existing = DB::table('restaurant_user')->where('restaurant_id', $restaurant->id)->where('user_id', $user->id)->lockForUpdate()->first();
            abort_if($existing && $existing->role === 'admin', 403);
            abort_if($existing && $actorRole === 'manager' && $existing->role !== 'employee', 403);
            abort_if($existing, 409, 'Cette personne est déjà affectée à ce restaurant.');
            $user->restaurants()->attach($restaurant->id, ['role' => $data['role']]);
            $this->audit($restaurant, $request->user(), $user, 'assigned', $data['role']);
        });
        return response()->json($this->member($restaurant->users()->whereKey($user->id)->first()), 201);
    }

    public function status(Request $request, Restaurant $restaurant, User $user)
    {
        $actorRole = RestaurantAccess::require($request, $restaurant, ['admin', 'manager']);
        $data = $request->validate([
            'is_active' => ['required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'expected_version' => ['nullable', 'integer', 'min:1'],
        ]);
        abort_if($user->id === $request->user()->id || $user->is_platform_admin, 403);
        if (!$data['is_active']) abort_if(empty($data['reason']), 422, 'Un motif est obligatoire.');
        DB::transaction(function () use ($request, $restaurant, $user, $data, $actorRole) {
            $pivot = DB::table('restaurant_user')->where('restaurant_id', $restaurant->id)->where('user_id', $user->id)->lockForUpdate()->first();
            abort_unless($pivot && in_array($pivot->role, $actorRole === 'manager' ? ['employee'] : ['manager', 'employee'], true), 404);
            abort_if(isset($data['expected_version']) && $pivot->version !== $data['expected_version'], 409, 'Affectation modifiée. Rechargez-la.');
            DB::table('restaurant_user')->where('id', $pivot->id)->update([
                'is_active' => $data['is_active'], 'version' => $pivot->version + 1, 'updated_at' => now(),
            ]);
            $this->audit($restaurant, $request->user(), $user, $data['is_active'] ? 'reactivated' : 'suspended', $pivot->role, $data['reason'] ?? null);
        });
        return response()->json($this->member($restaurant->users()->whereKey($user->id)->first()));
    }

    private function member(User $user): array
    {
        return [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'is_active' => (bool) $user->pivot->is_active, 'account_active' => $user->is_active,
            'role' => $user->pivot->role, 'version' => $user->pivot->version,
        ];
    }

    private function audit(Restaurant $restaurant, User $actor, User $member, string $action, string $role, ?string $reason = null): void
    {
        DB::table('restaurant_member_audit_logs')->insert([
            'restaurant_id' => $restaurant->id, 'actor_id' => $actor->id, 'member_id' => $member->id,
            'action' => $action, 'role' => $role, 'reason' => $reason, 'created_at' => now(),
        ]);
    }
}
