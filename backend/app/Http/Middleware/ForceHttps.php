<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class ForceHttps
{
    public function handle(Request $request, Closure $next)
    {
        if (app()->environment('testing')) {
            return $next($request);
        }

        if (config('app.force_https') || env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');

            if (!$request->isSecure()) {
                return redirect()->secure($request->getRequestUri());
            }
        }

        return $next($request);
    }
}
