<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
// Storage ikke nødvendig når vi bruger direkte URL'er

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

    // Generer 50 dummy posts
    for ($i = 0; $i < 50; $i++) {
        $postPk = Str::uuid();
        $randomUserPk = $users->random();

        // Tilfældigt beslut om posten skal have et billede (brug direkte Picsum-URL)
        $postImagePath = $faker->boolean(30)
            ? "https://picsum.photos/seed/{$postPk}/800/600"
            : null;

        DB::table('posts')->insert([
            'post_pk' => $postPk,
            'post_content' => $faker->realText(rand(20, 280)),
            'post_user_fk' => $randomUserPk,
            'created_at' => now(),
            'updated_at' => now(),
            'post_image_path' => $postImagePath,
        ]);
    }
}

    
}
