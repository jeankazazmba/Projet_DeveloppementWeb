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
use App\Http\Middleware\RequestTelemetry;
use App\Http\Middleware\RequireHttps;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: env('TRUSTED_PROXIES', ''));
        $middleware->prepend(RequestTelemetry::class);
        $middleware->prepend(RequireHttps::class);
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
                409 => 'conflict', 422 => 'validation_failed', 426 => 'https_required', default => 'server_error',
            };
            $validationDetails = $exception instanceof ValidationException
                ? collect($exception->errors())->map(static fn (array $messages) => array_map(static function (string $message): string {
                    // Sans les fichiers de traduction Laravel publiés, certaines règles
                    // renvoyaient leur clé technique (ex. `validation.confirmed`) au client.
                    return match ($message) {
                        'validation.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
                        'validation.required' => 'Ce champ est obligatoire.',
                        'validation.email' => 'Indiquez une adresse e-mail valide.',
                        'validation.unique' => 'Cette valeur est déjà utilisée.',
                        'validation.min.string' => 'La valeur saisie est trop courte.',
                        default => $message,
                    };
                }, $messages))->all()
                : null;
            $message = $exception instanceof ValidationException
                ? 'Les données transmises sont invalides.'
                : ($status >= 500 && !config('app.debug') ? 'Une erreur est survenue.' : ($exception->getMessage() ?: 'Une erreur est survenue.'));

            return response()->json([
                // message est conservé pour les clients existants.
                'message' => $message,
                'error' => array_filter([
                    'code' => $code,
                    'message' => $message,
                    'details' => $validationDetails,
                ]),
            ], $status);
        });
    })
    ->create();
