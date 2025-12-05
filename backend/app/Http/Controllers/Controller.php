<?php
namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     title="Weave Fullstack Exam API",
 *     version="1.0.0",
 *     description="REST API used by the frontend. Sanctum bearer tokens required for all protected endpoints."
 * )
 *
 * @OA\Schema(
 *     schema="Post",
 *     type="object",
 *     @OA\Property(property="post_pk", type="string", example="abc123"),
 *     @OA\Property(property="post_content", type="string", example="This is a post!"),
 *     @OA\Property(property="post_image_path", type="string", nullable=true, example="post_images/abc123.jpg"),
 *     @OA\Property(property="post_user_fk", type="string", example="user123"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="user", ref="#/components/schemas/User")
 * )
 *
 * @OA\Schema(
 *     schema="PostWithMetadata",
 *     type="object",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/Post"),
 *         @OA\Schema(
 *             @OA\Property(property="likes_count", type="integer", example=10),
 *             @OA\Property(property="comments_count", type="integer", example=5),
 *             @OA\Property(property="reposts_count", type="integer", example=2),
 *             @OA\Property(property="is_liked_by_user", type="boolean", example=false),
 *             @OA\Property(property="is_reposted_by_user", type="boolean", example=false)
 *         )
 *     }
 * )
 *
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     @OA\Property(property="user_pk", type="string", example="user123"),
 *     @OA\Property(property="user_username", type="string", example="johndoe"),
 *     @OA\Property(property="user_email", type="string", example="john@example.com"),
 *     @OA\Property(property="user_full_name", type="string", example="John Doe"),
 *     @OA\Property(property="user_profile_picture", type="string", nullable=true, example="profile_pictures/user123.jpg"),
 *     @OA\Property(property="user_cover_picture", type="string", nullable=true, example="cover_pictures/user123.jpg"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="UserWithFollowStatus",
 *     type="object",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/User"),
 *         @OA\Schema(
 *             @OA\Property(property="is_following", type="boolean", example=false)
 *         )
 *     }
 * )
 *
 * @OA\Schema(
 *     schema="UserWithEngagement",
 *     type="object",
 *     allOf={
 *         @OA\Schema(ref="#/components/schemas/User"),
 *         @OA\Schema(
 *             @OA\Property(property="posts_count", type="integer", example=10),
 *             @OA\Property(property="followers_count", type="integer", example=5),
 *             @OA\Property(property="following_count", type="integer", example=3),
 *             @OA\Property(property="reposts_count", type="integer", example=2)
 *         )
 *     }
 * )
 *
 * @OA\Schema(
 *     schema="Comment",
 *     type="object",
 *     @OA\Property(property="comment_pk", type="string", example="comment123"),
 *     @OA\Property(property="comment_message", type="string", example="This is a comment!"),
 *     @OA\Property(property="comment_post_fk", type="string", example="post123"),
 *     @OA\Property(property="comment_user_fk", type="string", example="user123"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="user", ref="#/components/schemas/User")
 * )
 *
 * @OA\Schema(
 *     schema="Repost",
 *     type="object",
 *     @OA\Property(property="repost_pk", type="string", example="repost123"),
 *     @OA\Property(property="repost_post_fk", type="string", example="post123"),
 *     @OA\Property(property="repost_user_fk", type="string", example="user123"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="TrendingTopic",
 *     type="object",
 *     @OA\Property(property="topic", type="string", example="laravel"),
 *     @OA\Property(property="post_count", type="integer", example=15),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-12-05T12:00:00Z")
 * )
 *
 * @OA\Schema(
 *     schema="Notification",
 *     type="object",
 *     @OA\Property(property="id", type="string", example="uuid123"),
 *     @OA\Property(property="type", type="string", example="App\Notifications\NewPostNotification"),
 *     @OA\Property(property="data", type="object", example={"post_id": "post123", "message": "New post from John"}),
 *     @OA\Property(property="read_at", type="string", format="date-time", nullable=true, example="2025-12-05T12:00:00Z"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-12-05T10:00:00Z")
 * )
 *
 * @OA\Schema(
 *     schema="NotificationPagination",
 *     type="object",
 *     @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Notification")),
 *     @OA\Property(
 *         property="meta",
 *         type="object",
 *         @OA\Property(property="current_page", type="integer", example=1),
 *         @OA\Property(property="last_page", type="integer", example=3),
 *         @OA\Property(property="per_page", type="integer", example=20),
 *         @OA\Property(property="total", type="integer", example=50),
 *         @OA\Property(property="unread_count", type="integer", example=5)
 *     )
 * )
 */
class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
