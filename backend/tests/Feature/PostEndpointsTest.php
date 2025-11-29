<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_update_and_delete_post(): void
    {
        $user = User::create([
            'user_pk' => (string) Str::uuid(),
            'user_full_name' => 'Poster Person',
            'user_username' => 'poster',
            'user_email' => 'poster@example.com',
            'user_password' => Hash::make('password123'),
        ]);

        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/posts', [
            'post_content' => 'Hello world',
        ]);

        $createResponse->assertCreated()
            ->assertJsonStructure(['post_pk', 'post_content']);

        $postPk = $createResponse->json('post_pk');

        $updateResponse = $this->putJson("/api/posts/{$postPk}", [
            'post_content' => 'Updated content',
        ]);

        $updateResponse->assertOk()
            ->assertJsonFragment(['post_content' => 'Updated content']);

        $deleteResponse = $this->deleteJson("/api/posts/{$postPk}");
        $deleteResponse->assertOk();

        $this->assertSoftDeleted('posts', ['post_pk' => $postPk]);
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson('/api/posts')->assertStatus(401);
        $this->postJson('/api/posts', ['post_content' => 'Blocked'])->assertStatus(401);
    }
}
