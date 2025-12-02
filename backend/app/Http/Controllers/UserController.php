<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UserController extends Controller
{
    public function usersToFollow(Request $request)
    {
        $currentUserPk = $request->user()->user_pk;
        $users = User::where('user_pk', '!=', $currentUserPk)
            ->whereDoesntHave('followers', function ($query) use ($currentUserPk) {
                $query->where('follower_user_fk', $currentUserPk);
            })
            ->inRandomOrder()
            ->limit(6)
            ->get()
            ->map(function ($user) {
                $user->is_following = false;
                return $user;
            });

        return response()->json($users);
    }


    public function show($userIdentifier)
    {
        $currentUser = Auth::user();
        $user = User::with(['posts.user', 'followers', 'following'])
            ->withCount(['posts', 'followers', 'following'])
            ->where('user_pk', $userIdentifier)
            ->orWhere('user_username', $userIdentifier)
            ->firstOrFail();

        $engagement = DB::table('user_engagements')
            ->where('user_pk', $user->user_pk)
            ->first();

        $user->reposts_count = $engagement->reposts_count ?? 0;

        $followers = $user->followers->map(function ($follower) use ($currentUser) {
            $follower->is_following = $currentUser ? $currentUser->isFollowing($follower) : false;
            return $follower;
        });

        $following = $user->following->map(function ($followedUser) {
            $followedUser->is_following = true;
            return $followedUser;
        });

        return response()->json([
            'user' => $user,
            'posts' => $user->posts,
            'followers' => $followers,
            'following' => $following,
        ]);
    }



    public function update(Request $request, $userPk)
    {
        $request->validate([
            'user_full_name' => 'required|string|max:255',
            'user_username' => 'required|string|max:255|unique:users,user_username,' . $userPk . ',user_pk',
            'user_email' => 'required|email|max:255|unique:users,user_email,' . $userPk . ',user_pk',
        ]);

        $user = User::findOrFail($userPk);
        $user->user_full_name = $request->user_full_name;
        $user->user_username = $request->user_username;
        $user->user_email = $request->user_email;
        $user->save();

        return response()->json($user);
    }

    public function destroy($userPk)
    {
        $user = User::findOrFail($userPk);

        DB::transaction(function () use ($user) {
            $now = now();
            DB::table('posts')
                ->where('post_user_fk', $user->user_pk)
                ->update(['deleted_at' => $now]);

            $user->delete();
        });

        return response()->json(['message' => 'User deleted successfully.']);
    }

    
public function uploadProfilePicture(Request $request, $userPk)
{
    $request->validate([
        'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

        $user = User::findOrFail($userPk);

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = 'profile_pictures/' . $userPk . '.' . $file->getClientOriginalExtension();
            Storage::disk('public')->put($filename, file_get_contents($file));
            $user->user_profile_picture = $filename;
            $user->save();
        }

        return response()->json([
            'message' => 'Profile picture uploaded successfully.',
            'user_profile_picture' => $user->user_profile_picture,
        ]);
    }

public function uploadCoverPicture(Request $request, $userPk)
{
    $request->validate([
        'cover_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:4096',
    ]);

        $user = User::findOrFail($userPk);

        if ($request->hasFile('cover_picture')) {
            $file = $request->file('cover_picture');
            $filename = 'cover_pictures/' . $userPk . '.' . $file->getClientOriginalExtension();
            Storage::disk('public')->put($filename, file_get_contents($file));
            $user->user_cover_picture = $filename;
            $user->save();
        }

        return response()->json([
            'message' => 'Cover picture uploaded successfully.',
            'user_cover_picture' => $user->user_cover_picture,
        ]);
    }


}
