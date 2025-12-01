<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class CommentsTableSeeder extends Seeder
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
        for ($i = 0; $i < 2000; $i++) {
            $commentPk = Str::uuid();
            $randomUserPk = $users->random();
            $randomPostPk = $posts->random();

            DB::table('comments')->insert([
                'comment_pk' => $commentPk,
                'comment_post_fk' => $randomPostPk,
                'comment_user_fk' => $randomUserPk,
                'comment_message' => $faker->realText(rand(10, 140)),
                'created_at' => now(),
            ]);
        }
    }
}
