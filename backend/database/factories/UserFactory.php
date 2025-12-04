<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
 public function definition(): array
{
    $userPk = (string) Str::uuid();
    $rawUsername = fake()->unique()->userName;
    $username = substr(preg_replace('/[^A-Za-z0-9._]/', '', $rawUsername), 0, 20) ?: 'user';

    return [
        'user_pk' => $userPk,
        'user_full_name' => fake()->name(),
        'user_username' => $username,
        'user_email' => fake()->unique()->safeEmail(),
        'user_password' => Hash::make('password123'),
        'user_profile_picture' => "https://picsum.photos/seed/{$userPk}/200/200",
        'created_at' => now(),
        'updated_at' => now(),
    ];
}


    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
