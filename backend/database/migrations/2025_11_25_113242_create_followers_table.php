<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->char('follower_user_fk', 50);
            $table->char('followed_user_fk', 50);

            $table->primary(['follower_user_fk', 'followed_user_fk']);

            $table->foreign('follower_user_fk')
                  ->references('user_pk')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('followed_user_fk')
                  ->references('user_pk')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('follows');
    }
};

