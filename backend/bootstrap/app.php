<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors; // Tilføj denne linje
use Sentry\Laravel\Integration;
use App\Http\Middleware\AuthTokenFromCookie;
use App\Http\Middleware\ForceHttps;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Global middleware to ensure CORS headers are applied even on preflight/404
        $middleware->use([HandleCors::class, ForceHttps::class]);

        $middleware->web(append: [
            HandleCors::class, // Tilføj CORS til web-middleware
        ]);

        $middleware->api(append: [
            HandleCors::class, // Tilføj CORS til API-middleware
            AuthTokenFromCookie::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        Integration::handles($exceptions);
    })
    ->create();
