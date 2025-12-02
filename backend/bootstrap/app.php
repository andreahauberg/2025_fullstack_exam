<?php

use App\Http\Middleware\ApiExceptionMiddleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\ConnectionException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->redirectGuestsTo(fn () => null);

        $middleware->web(append: [
            HandleCors::class,
        ]);

        $middleware->api(
            prepend: [
                ApiExceptionMiddleware::class,
            ],
            append: [
                HandleCors::class, 
            ],
        );
    })
    ->withExceptions(function (Exceptions $exceptions) {
        Integration::handles($exceptions);

        $exceptions->renderable(function (AuthenticationException $e, $request) {
            return new JsonResponse([
                'error' => 'unauthenticated',
                'message' => 'Unauthenticated.',
            ], 401);
        });

        $exceptions->renderable(function (ConnectionException|\PDOException $e, Request $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            return new JsonResponse([
                'error' => 'service_unavailable',
                'message' => 'The database is unavailable. Please try again later.',
            ], 503);
        });

        $exceptions->renderable(function (QueryException $e, Request $request) {
            if (! $request->expectsJson()) {
                return null;
            }

            return new JsonResponse([
                'error' => 'database_error',
                'message' => 'A database error occurred.',
            ], 500);
        });
    })
    ->create();