<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reposts', function (Blueprint $table) {
            $table->string('repost_pk', 50)->primary();
            $table->string('repost_post_fk');
            $table->string('repost_user_fk');
            $table->timestamps();

            $table->foreign('repost_post_fk')->references('post_pk')->on('posts')->onDelete('cascade');
            $table->foreign('repost_user_fk')->references('user_pk')->on('users')->onDelete('cascade');
            $table->unique(['repost_post_fk', 'repost_user_fk']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reposts');
    }
};
