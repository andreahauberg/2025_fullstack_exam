<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CookieTokenMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->headers->has('Authorization')) {
            $cookieToken = $request->cookie('auth_token');
            if ($cookieToken) {
                $request->headers->set('Authorization', 'Bearer '.$cookieToken);
            }
        }

        return $next($request);
    }
}
