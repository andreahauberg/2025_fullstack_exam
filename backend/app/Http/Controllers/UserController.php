<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
        /**
     * @OA\Get(
     *     path="/api/users-to-follow",
     *     summary="Get a list of users to follow",
     *     description="Returns a random list of 6 users that the current user is not already following.",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved a list of users to follow",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/UserWithFollowStatus")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while fetching users to follow",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while fetching users to follow."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */

    public function usersToFollow(Request $request)
{
    try {
        $currentUserPk = $request->user()->user_pk;
        $users = User::where('user_pk', '!=', $currentUserPk) 
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
        Log::error('Error fetching users to follow: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
        return response()->json([
            'error' => 'An error occurred while fetching users to follow.',
            'message' => $e->getMessage(),
        ], 500);
    }
}
    /**
     * @OA\Get(
     *     path="/api/users/{userIdentifier}",
     *     summary="Get detailed user information",
     *     description="Returns detailed information about a user, including their posts, followers, and following.",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="userIdentifier",
     *         in="path",
     *         description="User PK or username",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved user data",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", ref="#/components/schemas/UserWithEngagement"),
     *             @OA\Property(property="posts", type="array", @OA\Items(ref="#/components/schemas/Post")),
     *             @OA\Property(property="followers", type="array", @OA\Items(ref="#/components/schemas/UserWithFollowStatus")),
     *             @OA\Property(property="following", type="array", @OA\Items(ref="#/components/schemas/UserWithFollowStatus"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="User not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while fetching user data",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while fetching user data."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */

public function show($userIdentifier)
{
    try {
        $currentUser = Auth::user();
        $user = User::with(['posts.user', 'followers', 'following'])
            ->withCount(['posts', 'followers', 'following'])
            ->where('user_pk', $userIdentifier)
            ->orWhere('user_username', $userIdentifier)
            ->firstOrFail();

        // Hent reposts_count fra user_engagements view
        $engagement = DB::table('user_engagements')
            ->where('user_pk', $user->user_pk)
            ->first();

        // Tilføj reposts_count til user-objektet
        $user->reposts_count = $engagement->reposts_count ?? 0;

        // Tilføj is_following til followers
        $followers = $user->followers->map(function ($follower) use ($currentUser) {
            $follower->is_following = $currentUser ? $currentUser->isFollowing($follower) : false;
            return $follower;
        });

        // Tilføj is_following til following
        $following = $user->following->map(function ($followedUser) use ($currentUser) {
            $followedUser->is_following = $currentUser ? $currentUser->isFollowing($followedUser) : false;
            return $followedUser;
        });

        return response()->json([
            'user' => $user,
            'posts' => $user->posts,
            'followers' => $followers,
            'following' => $following,
        ]);
    } catch (\Exception $e) {
        \Log::error('Error fetching user data: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
        return response()->json([
            'error' => 'An error occurred while fetching user data.',
            'message' => $e->getMessage(),
        ], 500);
    }
}

    /**
     * @OA\Put(
     *     path="/api/users/{userPk}",
     *     summary="Update user information",
     *     description="Updates the full name, username, and email of a user.",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="userPk",
     *         in="path",
     *         description="User PK",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Updated user information",
     *         @OA\JsonContent(
     *             required={"user_full_name", "user_username", "user_email"},
     *             @OA\Property(property="user_full_name", type="string", example="John Doe"),
     *             @OA\Property(property="user_username", type="string", example="johndoe"),
     *             @OA\Property(property="user_email", type="string", format="email", example="john@example.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="User not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., duplicate username or email)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while updating user",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while updating user."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */


    public function update(Request $request, $userPk)
    {
        $request->validate([
            'user_full_name' => 'required|string|max:255',
            'user_username' => 'required|string|max:255|unique:users,user_username,' . $userPk . ',user_pk',
            'user_email' => 'required|email|max:255|unique:users,user_email,' . $userPk . ',user_pk',
        ]);

        try {
            $user = User::findOrFail($userPk);
            $user->user_full_name = $request->user_full_name;
            $user->user_username = $request->user_username;
            $user->user_email = $request->user_email;
            $user->save();

            return response()->json($user);
        } catch (\Exception $e) {
            Log::error('Error updating user: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'An error occurred while updating user.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

        /**
     * @OA\Delete(
     *     path="/api/users/{userPk}",
     *     summary="Delete a user",
     *     description="Soft-deletes a user and all their posts.",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="userPk",
     *         in="path",
     *         description="User PK",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="User deleted successfully.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="User not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while deleting user",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while deleting user."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */

    public function destroy($userPk)
    {
        try {
            $user = User::findOrFail($userPk);

            DB::transaction(function () use ($user) {
                $now = now();
                // Soft-delete brugerens posts
                DB::table('posts')
                    ->where('post_user_fk', $user->user_pk)
                    ->update(['deleted_at' => $now]);

                // Soft-delete user
                $user->delete();
            });

            return response()->json(['message' => 'User deleted successfully.']);
        } catch (\Exception $e) {
            Log::error('Error deleting user: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'An error occurred while deleting user.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    /**
     * @OA\Post(
     *     path="/api/users/{userPk}/profile-picture",
     *     summary="Upload a profile picture",
     *     description="Uploads a profile picture for the specified user.",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="userPk",
     *         in="path",
     *         description="User PK",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Profile picture file",
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"profile_picture"},
     *                 @OA\Property(property="profile_picture", type="string", format="binary", description="Image file (max 2MB, formats: jpeg, png, jpg, gif)")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Profile picture uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Profile picture uploaded successfully."),
     *             @OA\Property(property="user_profile_picture", type="string", example="profile_pictures/user123.jpg")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="User not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., invalid image format or size)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while uploading profile picture",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while uploading profile picture."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    
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
        Log::error('Error uploading profile picture: ' . $e->getMessage());
        return response()->json([
            'error' => 'An error occurred while uploading profile picture.',
            'message' => $e->getMessage(),
        ], 500);
    }
}
    /**
     * @OA\Post(
     *     path="/api/users/{userPk}/cover-picture",
     *     summary="Upload a cover picture",
     *     description="Uploads a cover picture for the specified user.",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="userPk",
     *         in="path",
     *         description="User PK",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Cover picture file",
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"cover_picture"},
     *                 @OA\Property(property="cover_picture", type="string", format="binary", description="Image file (max 4MB, formats: jpeg, png, jpg, gif)")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cover picture uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Cover picture uploaded successfully."),
     *             @OA\Property(property="user_cover_picture", type="string", example="cover_pictures/user123.jpg")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="User not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., invalid image format or size)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while uploading cover picture",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while uploading cover picture."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
public function uploadCoverPicture(Request $request, $userPk)
{
    $request->validate([
        'cover_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:4096',
    ]);

    try {
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
    } catch (\Exception $e) {
        Log::error('Error uploading cover picture: ' . $e->getMessage());
        return response()->json([
            'error' => 'An error occurred while uploading cover picture.',
            'message' => $e->getMessage(),
        ], 500);
    }
}


}
