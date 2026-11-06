<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireHttps
{
    public function handle(Request $request, Closure $next)
    {
        if (config('app.env') === 'production' && config('operations.require_https') && !$request->isSecure()) {
            abort(426, 'Une connexion HTTPS est requise.');
        }
        return $next($request);
    }
}
