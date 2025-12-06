<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;
use App\Models\User;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function api_root_returns_ok()
    {
        $response = $this->getJson('/');
        $response->assertStatus(200)
            ->assertJson(['message' => 'API is running']);
    }

    /** @test */
    public function user_can_signup_and_receive_token()
    {

        $data = [
            'user_full_name' => 'Test User',
            'user_username' => 'testuser',
            'user_email' => 'testuser@example.com',
            'user_password' => 'password123',
        ];

        $response = $this->postJson('/api/signup', $data);
        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'token',
                'user' => ['user_pk', 'user_email', 'user_username']
            ]);

        $this->assertDatabaseHas('users', [
            'user_email' => 'testuser@example.com',
        ]);
    }

    /** @test */
    public function user_can_login_and_receive_token()
    {
        $user = User::factory()->create([
            'user_password' => bcrypt('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'user_email' => $user->user_email,
            'user_password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'token', 'user']);
    }

    /** @test */
    public function protected_route_requires_auth()
    {
        $response = $this->getJson('/api/posts');
        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    /** @test */
    public function authenticated_user_can_crud_posts()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        // CREATE
        $postData = ['post_content' => 'Hello world!'];
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->postJson('/api/posts', $postData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'post_pk',
                'post_content',
                'post_user_fk',
                'created_at',
                'updated_at',
                'user' => [
                    'user_pk',
                    'user_username',
                    'user_email',
                    'user_full_name',
                    'user_profile_picture',
                    'created_at',
                    'updated_at',
                ]
            ])
            ->assertJsonFragment(['post_content' => 'Hello world!']);

        $postPk = $response->json('post_pk');

        // READ
        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/posts");
        $response->assertStatus(200)
            ->assertJsonFragment(['post_content' => 'Hello world!']);

        // UPDATE
        $updateData = ['post_content' => 'Updated content'];
        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->putJson("/api/posts/{$postPk}", $updateData);
        $response->assertStatus(200)
            ->assertJsonFragment(['post_content' => 'Updated content']);

        // DELETE
        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->deleteJson("/api/posts/{$postPk}");
        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'Post deleted successfully.']);

        // Soft delete assertion
        $this->assertSoftDeleted('posts', ['post_pk' => $postPk]);
    }

    /** @test */
    public function invalid_signup_returns_validation_errors()
    {
        $response = $this->postJson('/api/signup', [
            'user_full_name' => '',
            'user_username' => '',
            'user_email' => 'not-an-email',
            'user_password' => '123'
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure(['success', 'errors']);
    }
}
