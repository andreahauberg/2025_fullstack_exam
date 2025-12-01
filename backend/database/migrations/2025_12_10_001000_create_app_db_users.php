<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return; // DB users/privileges handled only for MySQL
        }

        $database = env('DB_DATABASE');
        $appUser = env('APP_DB_USERNAME', 'app_user');
        $appPass = env('APP_DB_PASSWORD', 'app_password');
        $adminUser = env('ADMIN_DB_USERNAME', 'admin_user');
        $adminPass = env('ADMIN_DB_PASSWORD', 'admin_password');

        $database = str_replace('`', '', $database);
        $appUser = str_replace('`', '', $appUser);
        $adminUser = str_replace('`', '', $adminUser);

        if ($database) {
            DB::unprepared("CREATE USER IF NOT EXISTS `{$appUser}`@'%' IDENTIFIED BY '{$appPass}'");
            DB::unprepared("GRANT SELECT, INSERT, UPDATE, DELETE ON `{$database}`.* TO `{$appUser}`@'%'");

            DB::unprepared("CREATE USER IF NOT EXISTS `{$adminUser}`@'%' IDENTIFIED BY '{$adminPass}'");
            DB::unprepared("GRANT ALL PRIVILEGES ON `{$database}`.* TO `{$adminUser}`@'%' WITH GRANT OPTION");
            DB::unprepared("FLUSH PRIVILEGES");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $appUser = str_replace('`', '', env('APP_DB_USERNAME', 'app_user'));
        $adminUser = str_replace('`', '', env('ADMIN_DB_USERNAME', 'admin_user'));

        DB::unprepared("DROP USER IF EXISTS `{$appUser}`@'%'");
        DB::unprepared("DROP USER IF EXISTS `{$adminUser}`@'%'");
        DB::unprepared("FLUSH PRIVILEGES");
    }
};
