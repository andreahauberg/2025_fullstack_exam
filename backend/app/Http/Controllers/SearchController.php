<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Post;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/search",
     *     summary="Search for users and posts",
     *     description="Searches for users and posts matching the provided query string. Returns a list of users and posts.",
     *     tags={"Search"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Search query",
     *         @OA\JsonContent(
     *             required={"query"},
     *             @OA\Property(property="query", type="string", example="john", description="The search term to match against usernames, full names, and post content")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved search results",
     *         @OA\JsonContent(
     *             @OA\Property(property="users", type="array", @OA\Items(ref="#/components/schemas/User")),
     *             @OA\Property(property="posts", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="post_pk", type="string", example="post123"),
     *                     @OA\Property(property="post_message", type="string", example="This is a post about John!"),
     *                     @OA\Property(property="post_image_path", type="string", nullable=true, example="post_images/post123.jpg"),
     *                     @OA\Property(property="user_pk", type="string", example="user123"),
     *                     @OA\Property(property="user_username", type="string", example="johndoe"),
     *                     @OA\Property(property="user_full_name", type="string", example="John Doe"),
     *                     @OA\Property(property="user_profile_picture", type="string", nullable=true, example="profile_pictures/user123.jpg")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Empty search query",
     *         @OA\JsonContent(
     *             @OA\Property(property="users", type="array", @OA\Items()),
     *             @OA\Property(property="posts", type="array", @OA\Items())
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while searching",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while searching."),
     *             @OA\Property(property="message", type="string")
     *         )
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
