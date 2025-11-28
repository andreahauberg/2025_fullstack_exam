<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function usersToFollow(Request $request)
{
    try {
        $currentUserPk = $request->user()->user_pk;
        $users = User::where('user_pk', '!=', $currentUserPk) // Filtrer den aktuelle bruger væk
            ->whereDoesntHave('followers', function ($query) use ($currentUserPk) {
                $query->where('follower_user_fk', $currentUserPk);
            })
            ->inRandomOrder()
            ->limit(6)
            ->get()
            ->map(function ($user) use ($currentUserPk) {
                $user->is_following = false;
                return $user;
            });
        return response()->json($users);
    } catch (\Exception $e) {
        \Log::error('Error fetching users to follow: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
        return response()->json([
            'error' => 'An error occurred while fetching users to follow.',
            'message' => $e->getMessage(),
        ], 500);
    }
}


public function show($userPk)
{
    try {
        $user = User::with(['posts.user', 'followers', 'following'])
            ->withCount(['posts', 'followers', 'following'])
            ->findOrFail($userPk);

        return response()->json([
            'user' => $user,
            'posts' => $user->posts,
            'followers' => $user->followers,
            'following' => $user->following,
        ]);
    } catch (\Exception $e) {
        \Log::error('Error fetching user data: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
        return response()->json([
            'error' => 'An error occurred while fetching user data.',
            'message' => $e->getMessage(),
        ], 500);
    }
}



    public function update(Request $request, $userPk)
    {
        $request->validate([
            'user_full_name' => 'required|string|max:255',
            'user_username' => 'required|string|max:255',
            'user_email' => 'required|email|max:255',
        ]);

        try {
            $user = User::findOrFail($userPk);
            $user->user_full_name = $request->user_full_name;
            $user->user_username = $request->user_username;
            $user->user_email = $request->user_email;
            $user->save();

            return response()->json($user);
        } catch (\Exception $e) {
            \Log::error('Error updating user: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'An error occurred while updating user.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($userPk)
    {
        try {
            $user = User::findOrFail($userPk);
            $user->delete();

            return response()->json(['message' => 'User deleted successfully.']);
        } catch (\Exception $e) {
            \Log::error('Error deleting user: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'An error occurred while deleting user.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    
public function uploadProfilePicture(Request $request, $userPk)
{
    $request->validate([
        'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    try {
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
    } catch (\Exception $e) {
        \Log::error('Error uploading profile picture: ' . $e->getMessage());
        return response()->json([
            'error' => 'An error occurred while uploading profile picture.',
            'message' => $e->getMessage(),
        ], 500);
    }
}


}

