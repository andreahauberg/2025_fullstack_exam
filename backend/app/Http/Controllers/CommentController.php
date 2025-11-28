<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommentController extends Controller
{
public function store(Request $request)
{
    $request->validate([
        'post_pk' => 'required|string|exists:posts,post_pk',
        'comment_message' => 'required|string|max:280',
    ]);

    $comment = Comment::create([
        'comment_pk' => Str::random(50),
        'comment_message' => $request->comment_message,
        'comment_post_fk' => $request->post_pk,
        'comment_user_fk' => auth()->user()->user_pk,
    ]);

    $comment->load('user');

    return response()->json($comment, 201);
}
public function update(Request $request, $comment_pk)
{
    $request->validate([
        'comment_message' => 'required|string|max:280',
    ]);

    $comment = Comment::findOrFail($comment_pk);
    $comment->comment_message = $request->comment_message;
    $comment->updated_at = NULL;
    $comment->save();

    $comment->load('user');

    return response()->json($comment);
}

public function destroy($comment_pk)
{
    $comment = Comment::findOrFail($comment_pk);
    $comment->delete();

    return response()->json(['message' => 'Comment deleted successfully.']);
}


}
