<?php
namespace App\Http\Controllers;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class FollowController extends Controller
{
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
        $follow = Follow::create([
            'follower_user_fk' => $request->user()->user_pk,
            'followed_user_fk' => $request->followed_user_fk,
        ]);
        return response()->json(['message' => 'Followed successfully!'], 201);
    } catch (\Exception $e) {
        \Log::error('Error following user: ' . $e->getMessage());
        return response()->json([
            'error' => 'An error occurred while following the user.',
            'message' => $e->getMessage(),
        ], 500);
    }
}


    public function destroy($followedUserPk)
    {
        try {
            Follow::where('follower_user_fk', auth()->user()->user_pk)
                  ->where('followed_user_fk', $followedUserPk)
                  ->delete();

            return response()->json(['message' => 'Unfollowed successfully!']);
        } catch (\Exception $e) {
            \Log::error('Error unfollowing user: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while unfollowing the user.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
