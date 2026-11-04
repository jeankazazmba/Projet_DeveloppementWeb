<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlatformUserController extends Controller
{
    public function store(Request $request)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12'],
            'restaurant_id' => ['required', Rule::exists('restaurants', 'id')],
            'role' => ['required', Rule::in(['admin', 'manager', 'employee'])],
        ]);
        $user = DB::transaction(function () use ($data) {
            $created = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
            $created->restaurants()->attach($data['restaurant_id'], ['role' => $data['role']]);
            return $created;
        });
        return response()->json($user->load('restaurants'), 201);
    }

    public function assign(Request $request, Restaurant $restaurant, User $user)
    {
        abort_unless($request->user()->is_platform_admin, 403);
        $data = $request->validate(['role' => ['required', Rule::in(['admin', 'manager', 'employee'])]]);
        $user->restaurants()->syncWithoutDetaching([$restaurant->id => ['role' => $data['role']]]);
        return $user->load('restaurants');
    }
}
