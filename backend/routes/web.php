<?php
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'API is running']);
});

Route::get('/test', function () {
    return response()->json(['message' => 'Test route works!']);
});

