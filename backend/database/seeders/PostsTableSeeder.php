<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class PostsTableSeeder extends Seeder
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

        // Mulige hashtags
        $possibleHashtags = [
            '#webdev', '#coding', '#reactjs', '#laravel', '#php', '#javascript',
            '#api', '#frontend', '#backend', '#developer', '#devlife', '#docker',
            '#mysql', '#programming', '#fullstack'
        ];

        // Generer et større datasæt
        for ($i = 0; $i < 800; $i++) {

            $postPk = Str::uuid();
            $randomUserPk = $users->random();

            // Generér en realistisk tekst
            $text = $faker->realText(rand(20, 180));

            // Tilføj 1–3 random hashtags
            $hashtags = collect($possibleHashtags)
                ->random(rand(1, 3))
                ->implode(' ');

            $postContent = $text . " " . $hashtags;

            // Picsum billede (30% chance)
            $postImagePath = $faker->boolean(30)
                ? "https://picsum.photos/seed/{$postPk}/800/600"
                : null;

            DB::table('posts')->insert([
                'post_pk'         => $postPk,
                'post_content'    => $postContent,
                'post_user_fk'    => $randomUserPk,
                'post_image_path' => $postImagePath,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
    }
}
