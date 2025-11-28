<?php
 
use Illuminate\Database\Migrations\Migration;

use Illuminate\Database\Schema\Blueprint;

use Illuminate\Support\Facades\Schema;
 
return new class extends Migration {

    public function up()

    {

        Schema::create('likes', function (Blueprint $table) {

            $table->char('like_pk', 50)->primary();
 
            $table->char('like_user_fk', 50);

            $table->char('like_post_fk', 50);
 
            $table->timestamps();
 
            $table->foreign('like_user_fk')

                  ->references('user_pk')

                  ->on('users')

                  ->onDelete('cascade');
 
            $table->foreign('like_post_fk')

                  ->references('post_pk')

                  ->on('posts')

                  ->onDelete('cascade');

        });

    }
 
    public function down()

    {

        Schema::dropIfExists('likes');

    }

};
