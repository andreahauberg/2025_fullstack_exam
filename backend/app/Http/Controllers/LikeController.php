<?php

namespace App\Http\Controllers;

use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class LikeController extends Controller
{

    /**
     * @OA\Post(
     *     path="/api/likes",
     *     summary="Like a post",
     *     description="Allows the authenticated user to like a post. Returns the created like object.",
     *     tags={"Likes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Post PK of the post to like",
     *         @OA\JsonContent(
     *             required={"post_pk"},
     *             @OA\Property(property="post_pk", type="string", example="post123", description="Primary key of the post to like")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Post liked successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="like_pk", type="string", example="like123"),
     *             @OA\Property(property="like_post_fk", type="string", example="post123"),
     *             @OA\Property(property="like_user_fk", type="string", example="user123"),
     *             @OA\Property(property="created_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Post not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Post not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error (e.g., missing post PK)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while liking the post",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    function store(Request $request)
    {
        $request->validate([
            'post_pk' => 'required|string',
        ]);

        $like = DB::transaction(function () use ($request) {
            return Like::create([
                'like_pk' => Str::random(50),
                'like_post_fk' => $request->post_pk,
                'like_user_fk' => auth()->user()->user_pk,
            ]);
        });

        return response()->json($like, 201);
    }
    /**
     * @OA\Delete(
     *     path="/api/likes/{post_pk}",
     *     summary="Remove a like from a post",
     *     description="Allows the authenticated user to remove their like from a post.",
     *     tags={"Likes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="post_pk",
     *         in="path",
     *         description="Primary key of the post to unlike",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Like removed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Like removed")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Like not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Like not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while removing the like",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */

    function destroy($post_pk)
    {
        DB::transaction(function () use ($post_pk) {
            $like = Like::where('like_post_fk', $post_pk)
                ->where('like_user_fk', auth()->user()->user_pk)
                ->lockForUpdate()
                ->firstOrFail();

            $like->delete();
        });

        return response()->json(['message' => 'Like removed']);
    }
}
