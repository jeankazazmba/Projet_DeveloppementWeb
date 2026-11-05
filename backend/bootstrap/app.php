<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Les permissions métier seront ajoutées après validation des rôles.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $exception, Request $request) {
            if (!$request->is('api/*')) return null;

            $status = match (true) {
                $exception instanceof AuthenticationException => 401,
                $exception instanceof AuthorizationException => 403,
                $exception instanceof ModelNotFoundException => 404,
                $exception instanceof ValidationException => 422,
                $exception instanceof HttpExceptionInterface => $exception->getStatusCode(),
                default => 500,
            };
            $code = match ($status) {
                401 => 'unauthenticated', 403 => 'forbidden', 404 => 'not_found',
                409 => 'conflict', 422 => 'validation_failed', default => 'server_error',
            };
            $message = $exception instanceof ValidationException
                ? 'Les données transmises sont invalides.'
                : ($exception->getMessage() ?: 'Une erreur est survenue.');

            return response()->json([
                // message est conservé pour les clients existants.
                'message' => $message,
                'error' => array_filter([
                    'code' => $code,
                    'message' => $message,
                    'details' => $exception instanceof ValidationException ? $exception->errors() : null,
                ]),
            ], $status);
        });
    })
    ->create();
