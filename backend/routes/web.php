<?php
use Illuminate\Support\Facades\Route;

// Dine API-routes
Route::get('/', function () {
    return response()->json(['message' => 'API is running']);
});

Route::get('/test', function () {
    return response()->json(['message' => 'Test route works!']);
});

// Catch-all route for React (placér den sidst)
Route::get('/{any}', function () {
    $response = response()->file(public_path('react/index.html'));
    $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    $response->headers->set('Pragma', 'no-cache');
    $response->headers->set('Expires', '0');

    return $response;
})->where('any', '^(?!api).*$');

