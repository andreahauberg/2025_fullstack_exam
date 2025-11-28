<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add column only if it's missing (keeps reruns idempotent for teammates).
        if (! Schema::hasColumn('personal_access_tokens', 'last_used_at')) {
            Schema::table('personal_access_tokens', function (Blueprint $table) {
                $table->timestamp('last_used_at')->nullable()->after('expires_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('personal_access_tokens', 'last_used_at')) {
            Schema::table('personal_access_tokens', function (Blueprint $table) {
                $table->dropColumn('last_used_at');
            });
        }
    }
};
