<?php
namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
public function index(Request $request)
{
    try {
        $page = $request->query('page', 1);
        $posts = Post::with(['user', 'comments.user'])
            ->withCount('likes')
            ->withCount('comments')
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'page', $page);

        $currentUserPk = $request->user() ? $request->user()->user_pk : null;
        $posts->getCollection()->transform(function ($post) use ($currentUserPk) {
            $post->is_liked_by_user = $currentUserPk ? $post->likes()->where('like_user_fk', $currentUserPk)->exists() : false;
            return $post;
        });


        return response()->json($posts);
    } catch (\Exception $e) {
        \Log::error('Error fetching posts: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
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

public function userPosts($userPk, Request $request)
{
    $posts = Post::with(['user', 'likes', 'comments'])
        ->where('post_user_fk', $userPk)
        ->orderBy('created_at', 'desc')
        ->paginate(10);


    return response()->json($posts);
}

}



