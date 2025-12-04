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
 *     tags={"Likes"},
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"post_pk"},
 *             @OA\Property(property="post_pk", type="string", example="POST123")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Like created successfully"
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Like already exists"
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error"
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
