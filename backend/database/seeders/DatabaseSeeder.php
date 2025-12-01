<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $tablesToTruncate = [
            'comment_events',
            'repost_audits',
            'comments',
            'likes',
            'follows',
            'reposts',
            'posts',
            'users',
            'personal_access_tokens',
        ];

        foreach ($tablesToTruncate as $table) {
            try {
                DB::table($table)->delete();
                // Reset auto increment where relevant (best effort)
                if (DB::getDriverName() === 'mysql') {
                    DB::statement("ALTER TABLE {$table} AUTO_INCREMENT = 1");
                }
            } catch (\Throwable $e) {
                // ignore if table missing
            }
        }

        $this->call([
            UsersTableSeeder::class,
            PostsTableSeeder::class,
            CommentsTableSeeder::class,
            FollowsTableSeeder::class,
            LikesTableSeeder::class,
        ]);
    }
}
