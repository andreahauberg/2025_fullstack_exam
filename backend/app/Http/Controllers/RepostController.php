<?php

namespace App\Http\Controllers;

use App\Models\Repost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class RepostController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/reposts",
     *     summary="Repost a post",
     *     description="Allows the authenticated user to repost a post. If the user has already reposted the post, the existing repost is returned.",
     *     tags={"Reposts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         description="Post PK of the post to repost",
     *         @OA\JsonContent(
     *             required={"post_pk"},
     *             @OA\Property(property="post_pk", type="string", example="post123", description="Primary key of the post to repost")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User had already reposted this post; existing repost returned",
     *         @OA\JsonContent(ref="#/components/schemas/Repost")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Post reposted successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Repost")
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
     *         description="Validation error (e.g., missing or invalid post PK)",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while reposting",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while reposting."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */


    public function store(Request $request)
    {
        $request->validate([
            'post_pk' => 'required|string|exists:posts,post_pk',
        ]);

        $existing = Repost::where('repost_post_fk', $request->post_pk)
            ->where('repost_user_fk', auth()->user()->user_pk)
            ->first();

        // If the user already reposted this post, just return the existing row
        if ($existing) {
            return response()->json($existing, 200);
        }

        $repost = DB::transaction(function () use ($request) {
            return Repost::create([
                'repost_pk' => Str::random(50),
                'repost_post_fk' => $request->post_pk,
                'repost_user_fk' => auth()->user()->user_pk,
            ]);
        });

        return response()->json($repost, 201);
    }
    /**
     * @OA\Delete(
     *     path="/api/reposts/{post_pk}",
     *     summary="Remove a repost",
     *     description="Allows the authenticated user to remove their repost of a post.",
     *     tags={"Reposts"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="post_pk",
     *         in="path",
     *         description="Primary key of the post to remove the repost from",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Repost removed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Repost removed")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Repost not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Repost not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while removing the repost",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while removing the repost."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function destroy($post_pk)
    {
        DB::transaction(function () use ($post_pk) {
            $repost = Repost::where('repost_post_fk', $post_pk)
                ->where('repost_user_fk', auth()->user()->user_pk)
                ->lockForUpdate()
                ->firstOrFail();

            $repost->delete();
        });

        return response()->json(['message' => 'Repost removed']);
    }
}
