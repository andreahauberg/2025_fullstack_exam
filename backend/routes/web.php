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
    return file_get_contents(public_path('react/index.html'));
})->where('any', '^(?!api).*$');
