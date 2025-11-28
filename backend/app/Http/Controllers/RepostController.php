<?php

namespace App\Http\Controllers;

use App\Models\Repost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RepostController extends Controller
{
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

        $repost = Repost::create([
            'repost_pk' => Str::random(50),
            'repost_post_fk' => $request->post_pk,
            'repost_user_fk' => auth()->user()->user_pk,
        ]);

        return response()->json($repost, 201);
    }

    public function destroy($post_pk)
    {
        $repost = Repost::where('repost_post_fk', $post_pk)
            ->where('repost_user_fk', auth()->user()->user_pk)
            ->firstOrFail();

        $repost->delete();

        return response()->json(['message' => 'Repost removed']);
    }
}
