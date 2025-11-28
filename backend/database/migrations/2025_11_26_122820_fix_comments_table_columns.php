<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The table already matches the expected schema (char(50) PK/FKs, timestamps).
        // This migration is kept to mirror the dump history; guarded to be a no-op.
        if (! Schema::hasTable('comments')) {
            return;
        }

        Schema::table('comments', function (Blueprint $table) {
            // Ensure indexes exist; add them if missing.
            $table->index('comment_post_fk', 'comments_comment_post_fk_index');
            $table->index('comment_user_fk', 'comments_comment_user_fk_index');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('comments')) {
            return;
        }

        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex('comments_comment_post_fk_index');
            $table->dropIndex('comments_comment_user_fk_index');
        });
    }
};
