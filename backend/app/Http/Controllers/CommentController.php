<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    /**
 * @OA\Post(
 *     path="/api/comments",
 *     summary="Create a new comment",
 *     security={{"bearerAuth":{}}},
 *     tags={"Comments"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"post_pk","comment_message"},
 *             @OA\Property(property="post_pk", type="string", example="POST123"),
 *             @OA\Property(property="comment_message", type="string", example="Nice post!")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Comment created"
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error"
 *     )
 * )
 */

public function store(Request $request)
{
    $request->validate([
        'post_pk' => 'required|string|exists:posts,post_pk',
        'comment_message' => 'required|string|max:280',
    ]);

    $comment = DB::transaction(function () use ($request) {
        return Comment::create([
            'comment_pk' => Str::random(50),
            'comment_message' => $request->comment_message,
            'comment_post_fk' => $request->post_pk,
            'comment_user_fk' => auth()->user()->user_pk,
        ]);
    });

    $comment->load('user');

    return response()->json($comment, 201);
}
public function update(Request $request, $comment_pk)
{
    $request->validate([
        'comment_message' => 'required|string|max:280',
    ]);

    $comment = DB::transaction(function () use ($request, $comment_pk) {
        $comment = Comment::lockForUpdate()->findOrFail($comment_pk);
        $comment->comment_message = $request->comment_message;
        $comment->updated_at = NULL;
        $comment->save();
        return $comment;
    });

    $comment->load('user');

    return response()->json($comment);
}

public function destroy($comment_pk)
{
    DB::transaction(function () use ($comment_pk) {
        $comment = Comment::lockForUpdate()->findOrFail($comment_pk);
        $comment->delete();
    });

    return response()->json(['message' => 'Comment deleted successfully.']);
}


}
