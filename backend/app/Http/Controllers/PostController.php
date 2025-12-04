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
 *     summary="Get paginated list of posts",
 *     tags={"Posts"},
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(
 *         name="page",
 *         in="query",
 *         description="Page number for pagination",
 *         required=false,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of posts retrieved successfully"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Server error"
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
            // synchronous delivery: write notifications to DB immediately 
            Notification::sendNow($followers, new NewPostNotification($post));
        }
    }
    return response()->json($post, 201);
}

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

public function destroy($post_pk)
{
    $post = Post::findOrFail($post_pk);
    $post->delete();

    return response()->json(['message' => 'Post deleted successfully.']);
}

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

    public function userReposts($userIdentifier, Request $request)
    {
        $currentUserPk = $request->user() ? $request->user()->user_pk : null;

        $userPk = \App\Models\User::where('user_pk', $userIdentifier)
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
