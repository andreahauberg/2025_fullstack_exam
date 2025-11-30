<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors; // Tilføj denne linje
use Sentry\Laravel\Integration;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // API-only app: don't redirect guests to a missing "login" route, just return 401
        $middleware->redirectGuestsTo(fn () => null);

        $middleware->web(append: [
            HandleCors::class, // Tilføj CORS til web-middleware
        ]);

        $middleware->api(append: [
            HandleCors::class, // Tilføj CORS til API-middleware
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        Integration::handles($exceptions);

        // Return JSON 401 instead of redirecting to a non-existent login route
        $exceptions->renderable(function (AuthenticationException $e, $request) {
            return new JsonResponse(['message' => 'Unauthenticated.'], 401);
        });
    })
    ->create();
