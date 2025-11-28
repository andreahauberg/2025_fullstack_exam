<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->char('user_pk', 50)->primary();
            $table->string('user_username', 20)->unique();
            $table->string('user_email', 100)->unique();
            $table->string('user_password', 255);
            $table->string('user_full_name', 255);
            $table->string('user_profile_picture')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            $table->timestamp('deleted_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
