<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Post;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
/**
 * @OA\Get(
 *     path="/api/search",
 *     summary="Search users and posts",
 *     tags={"Search"},
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(
 *         name="query",
 *         in="query",
 *         description="Search term",
 *         required=true,
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Search results retrieved successfully"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Server error"
 *     )
 * )
 */


    public function search(Request $request)
    {
        $query = $request->input('query', '');

        if (!$query) {
            return response()->json([
                'users' => [],
                'posts' => []
            ]);
        }

        try {

            $users = User::where('user_username', 'like', "%$query%")
                ->orWhere('user_full_name', 'like', "%$query%")
                ->limit(25)
                ->get(['user_pk','user_username','user_full_name','user_profile_picture']);


            $posts = Post::with('user')
                ->where('post_content', 'like', "%$query%")
                ->limit(25)
                ->get()
                ->map(function($post) {
                    return [
                        'post_pk' => $post->post_pk,
                        'post_message' => $post->post_content,
                        'post_image_path' => $post->post_image_path,
                        'user_pk' => $post->user->user_pk,
                        'user_username' => $post->user->user_username,
                        'user_full_name' => $post->user->user_full_name,
                        'user_profile_picture' => $post->user->user_profile_picture,
                    ];
                });

            return response()->json([
                'users' => $users,
                'posts' => $posts,
            ]);
        } catch (\Exception $e) {
            Log::error('Search error: '.$e->getMessage().' Trace: '.$e->getTraceAsString());
            return response()->json([
                'error' => 'An error occurred while searching.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
