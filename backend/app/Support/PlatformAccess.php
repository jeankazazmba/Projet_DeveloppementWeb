<?php

namespace App\Support;

use Illuminate\Http\Request;

class PlatformAccess
{
    public static function requireActiveAdmin(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && $user->is_platform_admin && $user->is_active, 403);
    }
}
