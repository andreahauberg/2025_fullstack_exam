<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthTokenFromCookie
{
    public function handle(Request $request, Closure $next)
    {
        $cookieName = config('session.auth_cookie', 'auth_token');

        if (!$request->bearerToken() && $request->hasCookie($cookieName)) {
            $request->headers->set('Authorization', 'Bearer '.$request->cookie($cookieName));
        }

        return $next($request);
    }
}
