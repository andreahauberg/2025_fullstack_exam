<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->char('comment_pk', 50)->primary();
            $table->char('comment_post_fk', 50);
            $table->char('comment_user_fk', 50);
            $table->text('comment_message');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            $table->timestamp('deleted_at')->nullable();

            $table->foreign('comment_post_fk')
                  ->references('post_pk')
                  ->on('posts')
                  ->onDelete('cascade');

            $table->foreign('comment_user_fk')
                  ->references('user_pk')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('comments');
    }
};

