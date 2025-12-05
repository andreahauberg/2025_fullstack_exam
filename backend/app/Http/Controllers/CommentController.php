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
     *     description="Creates a new comment on a post and returns the created comment with user information.",
     *     tags={"Comments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Comment content and post reference",
     *         @OA\JsonContent(
     *             required={"post_pk", "comment_message"},
     *             @OA\Property(property="post_pk", type="string", example="post123", description="Primary key of the post to comment on"),
     *             @OA\Property(property="comment_message", type="string", maxLength=280, example="This is a comment!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Comment created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Comment")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Post not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The selected post_pk is invalid.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., missing fields or invalid post reference)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while creating the comment",
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
    /**
     * @OA\Put(
     *     path="/api/comments/{comment_pk}",
     *     summary="Update a comment",
     *     description="Updates the message of an existing comment and returns the updated comment with user information.",
     *     tags={"Comments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="comment_pk",
     *         in="path",
     *         description="Primary key of the comment to update",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         description="Updated comment message",
     *         @OA\JsonContent(
     *             required={"comment_message"},
     *             @OA\Property(property="comment_message", type="string", maxLength=280, example="This is the updated comment.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Comment updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Comment")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Comment not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Comment not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., missing or invalid message)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while updating the comment",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */

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
       /**
     * @OA\Delete(
     *     path="/api/comments/{comment_pk}",
     *     summary="Delete a comment",
     *     description="Permanently deletes a comment identified by its primary key.",
     *     tags={"Comments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="comment_pk",
     *         in="path",
     *         description="Primary key of the comment to delete",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Comment deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Comment deleted successfully.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Comment not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Comment not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while deleting the comment",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
public function destroy($comment_pk)
{
    DB::transaction(function () use ($comment_pk) {
        $comment = Comment::lockForUpdate()->findOrFail($comment_pk);
        $comment->delete();
    });

    return response()->json(['message' => 'Comment deleted successfully.']);
}


}
