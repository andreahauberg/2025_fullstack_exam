<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EngagementEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_like_and_unlike_a_post(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);

        $post = $this->makePost($user);

        $likeResponse = $this->postJson('/api/likes', ['post_pk' => $post->post_pk]);
        $likeResponse->assertCreated();
        $this->assertDatabaseHas('likes', [
            'like_user_fk' => $user->user_pk,
            'like_post_fk' => $post->post_pk,
        ]);

        $unlikeResponse = $this->deleteJson("/api/likes/{$post->post_pk}");
        $unlikeResponse->assertOk();
        $this->assertDatabaseMissing('likes', [
            'like_user_fk' => $user->user_pk,
            'like_post_fk' => $post->post_pk,
        ]);
    }

    public function test_user_can_repost_and_remove_repost(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);
        $post = $this->makePost($user);

        $repostResponse = $this->postJson('/api/reposts', ['post_pk' => $post->post_pk]);
        $repostResponse->assertCreated();
        $this->assertDatabaseHas('reposts', [
            'repost_user_fk' => $user->user_pk,
            'repost_post_fk' => $post->post_pk,
        ]);

        $deleteResponse = $this->deleteJson("/api/reposts/{$post->post_pk}");
        $deleteResponse->assertOk();
        $this->assertDatabaseMissing('reposts', [
            'repost_user_fk' => $user->user_pk,
            'repost_post_fk' => $post->post_pk,
        ]);
    }

    public function test_user_can_comment_and_update_and_delete_comment(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);
        $post = $this->makePost($user);

        $create = $this->postJson('/api/comments', [
            'post_pk' => $post->post_pk,
            'comment_message' => 'Nice post',
        ]);

        $create->assertCreated()->assertJsonStructure(['comment_pk', 'comment_message']);
        $commentPk = $create->json('comment_pk');

        $update = $this->putJson("/api/comments/{$commentPk}", [
            'comment_message' => 'Edited message',
        ]);
        $update->assertOk()->assertJsonFragment(['comment_message' => 'Edited message']);

        $delete = $this->deleteJson("/api/comments/{$commentPk}");
        $delete->assertOk();
        $this->assertSoftDeleted('comments', ['comment_pk' => $commentPk]);
    }

    public function test_user_can_follow_and_unfollow_another_user(): void
    {
        $follower = $this->makeUser('follower@example.com', 'follower');
        $followed = $this->makeUser('followed@example.com', 'followed');
        Sanctum::actingAs($follower);

        $follow = $this->postJson('/api/follows', [
            'followed_user_fk' => $followed->user_pk,
        ]);

        $follow->assertCreated();
        $this->assertDatabaseHas('follows', [
            'follower_user_fk' => $follower->user_pk,
            'followed_user_fk' => $followed->user_pk,
        ]);

        $unfollow = $this->deleteJson("/api/follows/{$followed->user_pk}");
        $unfollow->assertOk();
        $this->assertDatabaseMissing('follows', [
            'follower_user_fk' => $follower->user_pk,
            'followed_user_fk' => $followed->user_pk,
        ]);
    }

    private function makeUser(string $email = 'user@example.com', string $username = 'user'): User
    {
        return User::create([
            'user_pk' => (string) Str::uuid(),
            'user_full_name' => 'Test User',
            'user_username' => $username,
            'user_email' => $email,
            'user_password' => Hash::make('password123'),
        ]);
    }

    private function makePost(User $user): Post
    {
        return Post::create([
            'post_pk' => (string) Str::uuid(),
            'post_content' => 'Hello',
            'post_user_fk' => $user->user_pk,
        ]);
    }
}
