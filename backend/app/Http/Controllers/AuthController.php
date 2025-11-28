<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

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

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully! Please login.',
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

    return response()->json([
        'success' => true,
        'message' => 'Logged in successfully!',
        'token' => $token,
        'user' => $user,
    ]);
}


}
