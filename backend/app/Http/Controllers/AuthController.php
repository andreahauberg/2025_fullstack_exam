<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_full_name' => 'required|string|max:20',
            'user_username' => 'required|string|max:20|unique:users,user_username',
            'user_email' => 'required|email|max:100|unique:users,user_email',
            'user_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userPk = Str::random(50);
        $user = User::create([
            'user_pk' => $userPk,
            'user_full_name' => $request->user_full_name,
            'user_username' => $request->user_username,
            'user_email' => $request->user_email,
            'user_password' => Hash::make($request->user_password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->withAuthCookie($token, [
            'success' => true,
            'message' => 'Account created successfully!',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'user_email' => 'required|email',
        'user_password' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors(),
        ], 422);
    }

    $user = User::where('user_email', $request->user_email)->first();

    if (!$user || !Hash::check($request->user_password, $user->user_password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
        ], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return $this->withAuthCookie($token, [
        'success' => true,
        'message' => 'Logged in successfully!',
        'token' => $token,
        'user' => $user,
    ]);
}


    private function withAuthCookie(string $token, array $payload, int $status = 200)
    {
        $cookieName = config('session.auth_cookie', 'auth_token');
        $minutes = (int) config('session.auth_cookie_minutes', 60 * 24 * 7); // 7 dage
        $domain = config('session.domain');
        $secure = (bool) config('session.secure', false);
        $httpOnly = true;
        $sameSite = config('session.same_site', 'lax');

        $cookie = Cookie::make($cookieName, $token, $minutes, '/', $domain, $secure, $httpOnly, false, $sameSite);

        return response()->json($payload, $status)->withCookie($cookie);
    }
}
