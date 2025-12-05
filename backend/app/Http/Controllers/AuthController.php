<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
        /**
     * @OA\Post(
     *     path="/api/signup",
     *     summary="Register a new user",
     *     description="Creates a new user account and returns a Sanctum auth token.",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         description="User registration details",
     *         @OA\JsonContent(
     *             required={"user_full_name", "user_username", "user_email", "user_password"},
     *             @OA\Property(property="user_full_name", type="string", maxLength=20, example="John Doe"),
     *             @OA\Property(property="user_username", type="string", maxLength=20, example="johndoe"),
     *             @OA\Property(property="user_email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="user_password", type="string", format="password", minLength=8, example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Account created successfully!"),
     *             @OA\Property(property="token", type="string", example="sanctum_token_here"),
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., missing fields or invalid email)",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */


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

        $userPk = (string) Str::uuid();
        $user = User::create([
            'user_pk' => $userPk,
            'user_full_name' => $request->user_full_name,
            'user_username' => $request->user_username,
            'user_email' => $request->user_email,
            'user_password' => Hash::make($request->user_password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully!',
            'token' => $token,
            'user' => $user,
        ], 201);
    }
    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Authenticate a user",
     *     description="Logs in a user and returns a Sanctum auth token.",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         description="User login credentials",
     *         @OA\JsonContent(
     *             required={"user_email", "user_password"},
     *             @OA\Property(property="user_email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="user_password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User logged in successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged in successfully!"),
     *             @OA\Property(property="token", type="string", example="sanctum_token_here"),
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid credentials")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., missing fields)",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */

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
