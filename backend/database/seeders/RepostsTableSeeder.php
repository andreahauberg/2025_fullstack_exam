<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RepostsTableSeeder extends Seeder
{
    public function run()
    {
        $users = DB::table('users')->pluck('user_pk');
        $posts = DB::table('posts')->pluck('post_pk');

        if ($users->isEmpty() || $posts->isEmpty()) {
            $this->command->info('No users or posts found. Please seed users and posts first.');
            return;
        }

        $target = 500;
        $created = 0;
        $attempts = 0;
        $maxAttempts = $target * 5;

        while ($created < $target && $attempts < $maxAttempts) {
            $attempts++;
            $userPk = $users->random();
            $postPk = $posts->random();

            $exists = DB::table('reposts')
                ->where('repost_user_fk', $userPk)
                ->where('repost_post_fk', $postPk)
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('reposts')->insert([
                'repost_pk' => Str::uuid(),
                'repost_user_fk' => $userPk,
                'repost_post_fk' => $postPk,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $created++;
        }

        $this->command->info("Seeded {$created} reposts.");
    }
}
