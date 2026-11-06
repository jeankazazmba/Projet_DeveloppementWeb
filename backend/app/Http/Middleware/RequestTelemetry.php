<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestTelemetry
{
    public function handle(Request $request, Closure $next): Response
    {
        $incoming = $request->header('X-Request-ID');
        $requestId = is_string($incoming) && preg_match('/^[A-Za-z0-9._:-]{8,80}$/', $incoming)
            ? $incoming : (string) Str::uuid();
        $request->attributes->set('request_id', $requestId);
        Log::withContext(['request_id' => $requestId]);
        $started = microtime(true);

        try {
            $response = $next($request);
            $response->headers->set('X-Request-ID', $requestId);
            Log::info('http.request', [
                'method' => $request->method(), 'route' => $request->route()?->uri(),
                'status' => $response->getStatusCode(), 'duration_ms' => round((microtime(true) - $started) * 1000, 1),
            ]);
            return $response;
        } catch (\Throwable $exception) {
            Log::error('http.request_failed', [
                'method' => $request->method(), 'route' => $request->route()?->uri(),
                'exception_type' => $exception::class,
                'duration_ms' => round((microtime(true) - $started) * 1000, 1),
            ]);
            throw $exception;
        }
    }
}
