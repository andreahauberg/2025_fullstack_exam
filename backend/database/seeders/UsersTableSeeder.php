<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Deaktiver fremmednøglekontrol
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Slet eksisterende data
        DB::table('users')->truncate();

        // Aktiver fremmednøglekontrol igen
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Use the password from .env
        $defaultPassword = env('SEED_USER_PASSWORD');

        // Generer et større datasæt
        for ($i = 0; $i < 150; $i++) {
            $userPk = Str::uuid();
            $profilePictureUrl = "https://picsum.photos/seed/{$userPk}/200/200";
            $rawUsername = $faker->unique()->userName;
            // Sikrer max 20 tegn for at matche schema/validering
            $username = substr(preg_replace('/[^A-Za-z0-9._]/', '', $rawUsername), 0, 20) ?: 'user' . $i;

            DB::table('users')->insert([
                'user_pk' => $userPk,
                'user_username' => $username,
                'user_email' => $faker->unique()->safeEmail,
                'user_password' => bcrypt($defaultPassword),
                'user_full_name' => $faker->name,
                'created_at' => now(),
                'user_profile_picture' => $profilePictureUrl,
            ]);
        }
    }
}
