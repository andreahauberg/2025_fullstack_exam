<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_signup_creates_user_and_returns_token(): void
    {
        $payload = [
            'user_full_name' => 'Test User',
            'user_username' => 'testuser',
            'user_email' => 'test@example.com',
            'user_password' => 'password123',
        ];

        $response = $this->postJson('/api/signup', $payload);

        $response->assertCreated()
            ->assertJsonStructure(['success', 'message', 'token', 'user' => ['user_pk', 'user_email']]);

        $this->assertDatabaseHas('users', [
            'user_email' => 'test@example.com',
            'user_username' => 'testuser',
        ]);

        $storedUser = User::where('user_email', 'test@example.com')->first();
        $this->assertTrue(Hash::check('password123', $storedUser->user_password));
    }

    public function test_signup_validates_required_fields(): void
    {
        $response = $this->postJson('/api/signup', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user_full_name', 'user_username', 'user_email', 'user_password']);
    }

    public function test_login_succeeds_with_valid_credentials(): void
    {
        $user = User::create([
            'user_pk' => (string) Str::uuid(),
            'user_full_name' => 'Jane Doe',
            'user_username' => 'janedoe',
            'user_email' => 'jane@example.com',
            'user_password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'user_email' => $user->user_email,
            'user_password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['success', 'message', 'token', 'user' => ['user_pk']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::create([
            'user_pk' => (string) Str::uuid(),
            'user_full_name' => 'John Doe',
            'user_username' => 'johndoe',
            'user_email' => 'john@example.com',
            'user_password' => Hash::make('correct-password'),
        ]);

        $response = $this->postJson('/api/login', [
            'user_email' => $user->user_email,
            'user_password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJsonFragment(['success' => false]);
    }
}
