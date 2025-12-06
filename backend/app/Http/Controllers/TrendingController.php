<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrendingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/trending",
     *     summary="Get trending topics",
     *     description="Returns a list of the 6 most popular hashtags from posts, sorted by usage frequency.",
     *     tags={"Trending"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successfully retrieved trending topics",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/TrendingTopic")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Internal server error while fetching trending topics",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="An error occurred while fetching trending."),
     *             @OA\Property(property="message", type="string")
     *         )
     *     )
     * )
     */
    public function index()
    {
        try {
            // Hent alle posts med hashtags
            $postsWithHashtags = DB::table('posts')
                ->where('post_content', 'REGEXP', '#[[:alnum:]]+')
                ->get(['post_pk', 'post_content', 'created_at']);
            // Ekstraher hashtags fra post_content
            $hashtags = [];
            foreach ($postsWithHashtags as $post) {
                preg_match_all('/#(\w+)/', $post->post_content, $matches);
                foreach ($matches[1] as $match) {
                    $hashtags[$match][] = $post->created_at;
                }
            }
            // Beregn antallet af posts og det seneste created_at for hver hashtag
            $trending = [];
            foreach ($hashtags as $hashtag => $timestamps) {
                $trending[] = [
                    'topic' => $hashtag,
                    'post_count' => count($timestamps),
                    'created_at' => max($timestamps),
                ];
            }
            // Sorter efter post_count i faldende rækkefølge
            usort($trending, function ($a, $b) {
                return $b['post_count'] - $a['post_count'];
            });
            // Begræns til de 6 mest populære hashtags
            $trending = array_slice($trending, 0, 6);
            return response()->json($trending);
        } catch (\Exception $e) {
            Log::error('Error fetching trending: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'An error occurred while fetching trending.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
