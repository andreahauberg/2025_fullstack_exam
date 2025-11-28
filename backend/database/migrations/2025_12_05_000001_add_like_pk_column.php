<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('likes')) {
            return;
        }

        // No-op: like_pk and primary key er allerede defineret i create_likes_table.
        // Behold migrationen for historik / batch-numre.
    }

    public function down(): void
    {
        // No-op
    }
};
