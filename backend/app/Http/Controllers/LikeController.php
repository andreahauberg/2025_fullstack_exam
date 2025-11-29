<?php

namespace App\Http\Controllers;

use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class LikeController extends Controller
{
    // Opret et like
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

    // Fjern et like
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
