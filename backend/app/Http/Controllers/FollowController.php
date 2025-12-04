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
 *     tags={"Follow"},
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"followed_user_fk"},
 *             @OA\Property(property="followed_user_fk", type="string", example="USER123")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Followed successfully"
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error"
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
