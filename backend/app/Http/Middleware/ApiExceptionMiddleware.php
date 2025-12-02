<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Closure;
use Illuminate\Database\ConnectionException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use PDOException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ApiExceptionMiddleware
{
    public function handle(Request $request, Closure $next): SymfonyResponse
    {
        try {
            return $next($request);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'validation_error',
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], $e->status ?? 422);
        } catch (AuthenticationException $e) {
            return response()->json([
                'error' => 'unauthenticated',
                'message' => 'Unauthenticated.',
            ], 401);
        } catch (AuthorizationException $e) {
            return response()->json([
                'error' => 'forbidden',
                'message' => $e->getMessage() ?: 'You are not allowed to perform this action.',
            ], 403);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'not_found',
                'message' => 'Resource not found.',
            ], 404);
        } catch (ConnectionException|PDOException $e) {
            Log::error('Database connection error', [
                'message' => $e->getMessage(),
                'path' => $request->path(),
            ]);

            return response()->json([
                'error' => 'service_unavailable',
                'message' => 'The database is unavailable. Please try again later.',
            ], 503);
        } catch (QueryException $e) {
            Log::error('Database query error', [
                'message' => $e->getMessage(),
                'path' => $request->path(),
                'sql' => config('app.debug') ? $e->getSql() : null,
            ]);

            return response()->json([
                'error' => 'database_error',
                'message' => 'A database error occurred.',
            ], 500);
        } catch (HttpResponseException $e) {
            return $this->ensureJsonResponse($e->getResponse());
        } catch (HttpExceptionInterface $e) {
            $status = $e->getStatusCode();

            return response()->json([
                'error' => $status >= 500 ? 'server_error' : 'http_error',
                'message' => $e->getMessage() ?: (SymfonyResponse::$statusTexts[$status] ?? 'HTTP error'),
            ], $status, $e->getHeaders());
        } catch (Throwable $e) {
            Log::error('Unhandled API exception', [
                'message' => $e->getMessage(),
                'path' => $request->path(),
                'method' => $request->method(),
                'user' => optional($request->user())->user_pk,
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ]);

            return response()->json([
                'error' => 'server_error',
                'message' => config('app.debug') ? $e->getMessage() : 'An unexpected error occurred.',
            ], 500);
        }
    }

    private function ensureJsonResponse(SymfonyResponse $response): JsonResponse
    {
        if ($response instanceof JsonResponse) {
            return $response;
        }

        return response()->json([
            'error' => $response->getStatusCode() >= 500 ? 'server_error' : 'http_error',
            'message' => $response->getContent() ?: 'An error occurred.',
        ], $response->getStatusCode(), $response->headers->all());
    }
}