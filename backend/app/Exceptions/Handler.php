<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use Throwable;
use Sentry\Laravel\Facade as Sentry;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class Handler extends ExceptionHandler
{
    protected $dontReport = [
        //
    ];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function report(Throwable $exception)
    {
        // Send exception to Sentry if DSN is configured
        if (app()->bound('sentry') && $this->shouldReport($exception)) {
            Sentry::captureException($exception);
        }

        parent::report($exception);
    }

public function render($request, Throwable $exception)
{
    if ($request->expectsJson()) {

        // Validation errors
        if ($exception instanceof ValidationException) {
            Sentry::captureException($exception);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors(),
            ], 422);
        }

        // Generelle exceptions
        $status = 500; // default
        if ($exception instanceof HttpExceptionInterface) {
            $status = $exception->getStatusCode();
        }

        return response()->json([
            'success' => false,
            'message' => $exception->getMessage(),
        ], $status);
    }

    return parent::render($request, $exception);
}

}
