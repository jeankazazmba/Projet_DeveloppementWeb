<?php

namespace App\Support;

use App\Models\Restaurant;
use Illuminate\Http\Request;

/** Droits locaux par défaut : aucune délégation implicite au gérant. */
class RestaurantAccess
{
    public static function role(Request $request, Restaurant $restaurant): string
    {
        $user = $request->user();
        abort_if(!$user || !$user->is_active || $user->is_platform_admin, 403);
        $role = $user->restaurants()->whereKey($restaurant->id)->first()?->pivot?->role;
        abort_unless(in_array($role, ['admin', 'manager', 'employee'], true), 404);
        return $role;
    }

    public static function require(Request $request, Restaurant $restaurant, array $roles): string
    {
        $role = self::role($request, $restaurant);
        abort_unless(in_array($role, $roles, true), 403);
        return $role;
    }
}
