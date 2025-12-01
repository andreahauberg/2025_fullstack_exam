<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class LikesTableSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Hent eksisterende brugere og posts
        $users = DB::table('users')->pluck('user_pk');
        $posts = DB::table('posts')->pluck('post_pk');

        if ($users->isEmpty() || $posts->isEmpty()) {
            $this->command->info('No users or posts found. Please seed users and posts first.');
            return;
        }

        // Generer et større datasæt
        for ($i = 0; $i < 3000; $i++) {
            $likePk = Str::uuid();
            $randomUserPk = $users->random();
            $randomPostPk = $posts->random();

            // Tjek om like-relationen allerede findes
            $exists = DB::table('likes')
                ->where('like_user_fk', $randomUserPk)
                ->where('like_post_fk', $randomPostPk)
                ->exists();

            if (!$exists) {
                DB::table('likes')->insert([
                    'like_pk' => $likePk,
                    'like_user_fk' => $randomUserPk,
                    'like_post_fk' => $randomPostPk,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
