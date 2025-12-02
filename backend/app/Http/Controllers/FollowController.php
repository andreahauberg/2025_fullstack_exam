<?php
namespace App\Http\Controllers;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

    DB::transaction(function () use ($request) {
        Follow::create([
            'follower_user_fk' => $request->user()->user_pk,
            'followed_user_fk' => $request->followed_user_fk,
        ]);
    });
    return response()->json(['message' => 'Followed successfully!'], 201);
}


    public function destroy($followedUserPk)
    {
        DB::transaction(function () use ($followedUserPk) {
            Follow::where('follower_user_fk', auth()->user()->user_pk)
                ->where('followed_user_fk', $followedUserPk)
                ->lockForUpdate()
                ->delete();
        });

        return response()->json(['message' => 'Unfollowed successfully!']);
    }
}
