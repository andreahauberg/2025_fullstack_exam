<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'API is running']);
});


Route::get('/test-web', function () {
    return 'Web route OK';
});

Route::get('/{any}', function () {
    $indexPath = public_path('index.html');
    if (!file_exists($indexPath)) {
        return "React build ikke fundet. Kør: npm run build";
    }
    return file_get_contents($indexPath);
})->where('any', '^(?!api).*$');
