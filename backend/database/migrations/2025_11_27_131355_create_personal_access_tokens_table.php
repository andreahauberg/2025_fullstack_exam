<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('tokenable_id', 50);
            $table->string('tokenable_type');
            $table->foreign('tokenable_id')->references('user_pk')->on('users')->onDelete('cascade');
            $table->index(['tokenable_id', 'tokenable_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
