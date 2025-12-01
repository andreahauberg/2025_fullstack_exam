<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class FollowsTableSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Hent eksisterende brugere
        $users = DB::table('users')->pluck('user_pk');

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please seed users first.');
            return;
        }

        // Generer et større datasæt
        for ($i = 0; $i < 2000; $i++) {
            $followerUserPk = $users->random();
            $followedUserPk = $users->random();

            // Undgå at en bruger følger sig selv
            while ($followerUserPk === $followedUserPk) {
                $followedUserPk = $users->random();
            }

            // Tjek om follow-relationen allerede findes
            $exists = DB::table('follows')
                ->where('follower_user_fk', $followerUserPk)
                ->where('followed_user_fk', $followedUserPk)
                ->exists();

            if (!$exists) {
                DB::table('follows')->insert([
                    'follower_user_fk' => $followerUserPk,
                    'followed_user_fk' => $followedUserPk,
                ]);
            }
        }
    }
}
