<?php

namespace App\Support;

use Illuminate\Http\Request;

class StudentAccess
{
    public static function require(Request $request): void
    {
        abort_unless($request->user()?->is_active && !$request->user()->is_platform_admin && $request->user()->studentProfile()->exists(), 403);
    }
}
