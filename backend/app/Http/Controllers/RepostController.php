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
 *     tags={"Reposts"},
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
 *         description="Post reposted successfully"
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Post already reposted"
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
