<?php
namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Repost;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Notifications\NewPostNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/posts",
     *     summary="Get paginated list of all posts",
     *     description="Returns a paginated list of all posts, including likes, comments, and reposts counts, as well as user follow status.",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination (default: 1)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved paginated list of all posts",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/PostWithMetadata"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while fetching posts",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while fetching posts."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        try {
            $page = $request->query('page', 1);
            $currentUserPk = $request->user() ? $request->user()->user_pk : null;
            $posts = Post::with(['user', 'comments.user'])
                ->withCount(['likes', 'comments', 'reposts'])
                ->orderBy('created_at', 'desc')
                ->paginate(10, ['*'], 'page', $page);
            $posts->getCollection()->transform(function ($post) use ($currentUserPk) {
                $post->is_liked_by_user = $currentUserPk ? $post->likes()->where('like_user_fk', $currentUserPk)->exists() : false;
                $post->is_reposted_by_user = $currentUserPk ? $post->reposts()->where('repost_user_fk', $currentUserPk)->exists() : false;
                if ($post->relationLoaded('user') && $post->user) {
                    $post->user->is_following = $currentUserPk
                        ? DB::table('follows')
                            ->where('followed_user_fk', $post->post_user_fk)
                            ->where('follower_user_fk', $currentUserPk)
                            ->exists()
                        : false;
                }
                return $post;
            });
            return response()->json($posts);
        } catch (\Exception $e) {
            Log::error('Error fetching posts: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'An error occurred while fetching posts.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/posts",
     *     summary="Create a new post",
     *     description="Creates a new post with optional image upload. Notifies the author's followers about the new post.",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Post content and optional image",
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"post_content"},
     *                 @OA\Property(property="post_content", type="string", maxLength=280, example="This is a new post!"),
     *                 @OA\Property(property="post_image", type="string", format="binary", description="Image file (max 2MB, formats: jpeg, png, jpg, gif)")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Post created successfully and followers notified",
     *         @OA\JsonContent(ref="#/components/schemas/Post")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., missing content or invalid image)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while creating the post",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'post_content' => 'required|string|max:280',
            'post_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        $post = Post::create([
            'post_pk' => Str::random(50),
            'post_content' => $request->post_content,
            'post_user_fk' => auth()->user()->user_pk,
        ]);
        if ($request->hasFile('post_image')) {
            $file = $request->file('post_image');
            $filename = 'post_images/' . $post->post_pk . '.' . $file->getClientOriginalExtension();
            Storage::disk('public')->put($filename, file_get_contents($file));
            $post->post_image_path = $filename;
            $post->save();
        }
        $post->load('user');
        $author = $post->user;
        if ($author) {
            $followers = $author->followers()->get();
            if ($followers->isNotEmpty()) {
                Notification::sendNow($followers, new NewPostNotification($post));
            }
        }
        return response()->json($post, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/posts/{post_pk}",
     *     summary="Update an existing post",
     *     description="Updates the content of an existing post identified by its primary key.",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="post_pk",
     *         in="path",
     *         description="Primary key of the post to update",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Updated post content",
     *         @OA\JsonContent(
     *             required={"post_content"},
     *             @OA\Property(property="post_content", type="string", maxLength=280, example="This is the updated post content.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Post updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Post")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Post not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Post not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., missing or invalid content)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while updating the post",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $post_pk)
    {
        $request->validate([
            'post_content' => 'required|string|max:280',
        ]);
        $post = Post::findOrFail($post_pk);
        $post->post_content = $request->post_content;
        $post->updated_at = NULL;
        $post->save();
        return response()->json($post);
    }

    /**
     * @OA\Delete(
     *     path="/api/posts/{post_pk}",
     *     summary="Delete an existing post",
     *     description="Permanently deletes a post identified by its primary key.",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="post_pk",
     *         in="path",
     *         description="Primary key of the post to delete",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Post deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Post deleted successfully.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Post not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Post not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while deleting the post",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function destroy($post_pk)
    {
        $post = Post::findOrFail($post_pk);
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully.']);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{userIdentifier}/posts",
     *     summary="Get paginated list of posts for a specific user",
     *     description="Returns a paginated list of posts created by the specified user, including likes, comments, and reposts counts.",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="userIdentifier",
     *         in="path",
     *         description="User PK or username",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination (default: 1)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved paginated list of user's posts",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/PostWithMetadata"))
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
     *         description="Internal server error while fetching user's posts",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function userPosts($userIdentifier, Request $request)
    {
        $currentUserPk = $request->user() ? $request->user()->user_pk : null;
        $resolvedUserPk = User::where('user_pk', $userIdentifier)
            ->orWhere('user_username', $userIdentifier)
            ->value('user_pk');
        if (!$resolvedUserPk) {
            return response()->json(['error' => 'User not found'], 404);
        }
        $posts = Post::with(['user', 'likes', 'reposts', 'comments.user'])
            ->where('post_user_fk', $resolvedUserPk)
            ->orderBy('created_at', 'desc')
            ->withCount(['likes', 'comments', 'reposts'])
            ->paginate(10);
        $posts->getCollection()->transform(function ($post) use ($currentUserPk) {
            $post->is_liked_by_user = $currentUserPk ? $post->likes()->where('like_user_fk', $currentUserPk)->exists() : false;
            $post->is_reposted_by_user = $currentUserPk ? $post->reposts()->where('repost_user_fk', $currentUserPk)->exists() : false;
            if ($post->relationLoaded('user') && $post->user) {
                $post->user->is_following = $currentUserPk
                    ? DB::table('follows')
                        ->where('followed_user_fk', $post->post_user_fk)
                        ->where('follower_user_fk', $currentUserPk)
                        ->exists()
                    : false;
            }
            return $post;
        });
        return response()->json($posts);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{userIdentifier}/reposts",
     *     summary="Get paginated list of reposts for a specific user",
     *     description="Returns a paginated list of posts that the specified user has reposted, including likes, comments, and reposts counts.",
     *     tags={"Posts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="userIdentifier",
     *         in="path",
     *         description="User PK or username",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination (default: 1)",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved paginated list of user's reposts",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/PostWithMetadata"))
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
     *         description="Internal server error while fetching user's reposts",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function userReposts($userIdentifier, Request $request)
    {
        $currentUserPk = $request->user() ? $request->user()->user_pk : null;
        $userPk = User::where('user_pk', $userIdentifier)
            ->orWhere('user_username', $userIdentifier)
            ->value('user_pk');
        if (!$userPk) {
            return response()->json(['error' => 'User not found'], 404);
        }
        $posts = Post::with(['user', 'comments.user'])
            ->whereHas('reposts', function ($query) use ($userPk) {
                $query->where('repost_user_fk', $userPk);
            })
            ->orderBy('created_at', 'desc')
            ->withCount(['likes', 'comments', 'reposts'])
            ->paginate(10);
        $posts->getCollection()->transform(function ($post) use ($currentUserPk) {
            $post->is_liked_by_user = $currentUserPk ? $post->likes()->where('like_user_fk', $currentUserPk)->exists() : false;
            $post->is_reposted_by_user = $currentUserPk ? $post->reposts()->where('repost_user_fk', $currentUserPk)->exists() : false;
            if ($post->relationLoaded('user') && $post->user) {
                $post->user->is_following = $currentUserPk
                    ? DB::table('follows')
                        ->where('followed_user_fk', $post->post_user_fk)
                        ->where('follower_user_fk', $currentUserPk)
                        ->exists()
                    : false;
            }
            return $post;
        });
        return response()->json($posts);
    }
}
