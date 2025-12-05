<?php
namespace App\Http\Controllers;
use App\Models\Follow;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FollowController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/follows",
     *     summary="Follow a user",
     *     description="Allows the authenticated user to follow another user. You cannot follow yourself.",
     *     tags={"Follows"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="User PK of the user to follow",
     *         @OA\JsonContent(
     *             required={"followed_user_fk"},
     *             @OA\Property(property="followed_user_fk", type="string", example="user123", description="Primary key of the user to follow")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Followed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Followed successfully!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="You cannot follow yourself",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="You cannot follow yourself.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The selected followed_user_fk is invalid.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., missing or invalid user PK)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while following the user",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while following the user."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */

   public function store(Request $request)
{
    $request->validate([
        'followed_user_fk' => [
            'required',
            'string',
            'exists:users,user_pk',
            function ($attribute, $value, $fail) use ($request) {
                if ($value === $request->user()->user_pk) {
                    $fail('You cannot follow yourself.');
                }
            },
        ],
    ]);

    try {
        DB::transaction(function () use ($request) {
            Follow::create([
                'follower_user_fk' => $request->user()->user_pk,
                'followed_user_fk' => $request->followed_user_fk,
            ]);
        });
        return response()->json(['message' => 'Followed successfully!'], 201);
    } catch (\Exception $e) {
        Log::error('Error following user: ' . $e->getMessage());
        return response()->json([
            'error' => 'An error occurred while following the user.',
            'message' => $e->getMessage(),
        ], 500);
    }
}
 /**
     * @OA\Delete(
     *     path="/api/follows/{followedUserPk}",
     *     summary="Unfollow a user",
     *     description="Allows the authenticated user to unfollow another user.",
     *     tags={"Follows"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="followedUserPk",
     *         in="path",
     *         description="Primary key of the user to unfollow",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Unfollowed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unfollowed successfully!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Follow relationship not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Follow relationship not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while unfollowing the user",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while unfollowing the user."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */

    public function destroy($followedUserPk)
    {
        try {
            DB::transaction(function () use ($followedUserPk) {
                Follow::where('follower_user_fk', auth()->user()->user_pk)
                    ->where('followed_user_fk', $followedUserPk)
                    ->lockForUpdate()
                    ->delete();
            });

            return response()->json(['message' => 'Unfollowed successfully!']);
        } catch (\Exception $e) {
            Log::error('Error unfollowing user: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while unfollowing the user.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
