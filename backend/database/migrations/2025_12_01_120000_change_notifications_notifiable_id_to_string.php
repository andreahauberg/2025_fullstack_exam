<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change notifiable_id to string to support non-integer PKs (user_pk)
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE `notifications` MODIFY `notifiable_id` VARCHAR(191) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // revert back to unsigned big int
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE `notifications` MODIFY `notifiable_id` BIGINT UNSIGNED NOT NULL");
    }
};
