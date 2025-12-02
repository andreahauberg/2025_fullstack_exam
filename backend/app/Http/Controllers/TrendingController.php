<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrendingController extends Controller
{
    public function index()
    {
        $postsWithHashtags = DB::table('posts')
            ->where('post_content', 'REGEXP', '#[[:alnum:]]+')
            ->get(['post_pk', 'post_content', 'created_at']);

        $hashtags = [];
        foreach ($postsWithHashtags as $post) {
            preg_match_all('/#(\w+)/', $post->post_content, $matches);
            foreach ($matches[1] as $match) {
                $hashtags[$match][] = $post->created_at;
            }
        }

        $trending = [];
        foreach ($hashtags as $hashtag => $timestamps) {
            $trending[] = [
                'topic' => $hashtag,
                'post_count' => count($timestamps),
                'created_at' => max($timestamps),
            ];
        }

        usort($trending, function ($a, $b) {
            return $b['post_count'] - $a['post_count'];
        });

        $trending = array_slice($trending, 0, 6);

        return response()->json($trending);
    }
}


