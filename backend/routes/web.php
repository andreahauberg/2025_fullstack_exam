<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;
use App\Http\Controllers\AuthController;

// Sanctum CSRF endpoint (SPA mode)
Route::middleware('web')->get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

Route::middleware('web')->get('/', function () {
    return response()->json(['status' => 'ok']);
});
