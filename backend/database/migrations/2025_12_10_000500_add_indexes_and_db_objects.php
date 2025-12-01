<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        // ---------- Indexes ----------
        Schema::table('posts', function (Blueprint $table) {
            $table->index(['post_user_fk', 'created_at'], 'posts_user_created_idx');
        });
        Schema::table('comments', function (Blueprint $table) {
            $table->index('comment_post_fk', 'comments_post_idx');
            $table->index('comment_user_fk', 'comments_user_idx');
        });
        Schema::table('likes', function (Blueprint $table) {
            $table->index('like_post_fk', 'likes_post_idx');
            $table->index('like_user_fk', 'likes_user_idx');
        });
        Schema::table('reposts', function (Blueprint $table) {
            $table->index('repost_user_fk', 'reposts_user_idx');
            $table->index('repost_post_fk', 'reposts_post_idx');
        });
        Schema::table('follows', function (Blueprint $table) {
            $table->index('followed_user_fk', 'follows_followed_idx');
            $table->index('follower_user_fk', 'follows_follower_idx');
        });
        if (!Schema::hasTable('comment_events')) {
            Schema::create('comment_events', function (Blueprint $table) {
                $table->id();
                $table->char('comment_pk', 50);
                $table->string('event_type', 20);
                $table->timestamp('created_at')->useCurrent();
            });
        }
        if (!Schema::hasTable('repost_audits')) {
            Schema::create('repost_audits', function (Blueprint $table) {
                $table->id();
                $table->char('repost_pk', 50)->nullable();
                $table->char('user_pk', 50);
                $table->char('post_pk', 50);
                $table->timestamp('created_at')->useCurrent();
            });
        }
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::unprepared('DROP VIEW IF EXISTS user_engagements');
            DB::unprepared("
                CREATE VIEW user_engagements AS
                SELECT
                    u.user_pk,
                    u.user_username,
                    u.user_full_name,
                    (SELECT COUNT(*) FROM posts p WHERE p.post_user_fk = u.user_pk) AS posts_count,
                    (SELECT COUNT(*) FROM comments c WHERE c.comment_user_fk = u.user_pk) AS comments_count,
                    (SELECT COUNT(*) FROM likes l WHERE l.like_user_fk = u.user_pk) AS likes_given,
                    (SELECT COUNT(*) FROM likes l2 JOIN posts p2 ON l2.like_post_fk = p2.post_pk WHERE p2.post_user_fk = u.user_pk) AS likes_received,
                    (SELECT COUNT(*) FROM follows f WHERE f.follower_user_fk = u.user_pk) AS following_count,
                    (SELECT COUNT(*) FROM follows f WHERE f.followed_user_fk = u.user_pk) AS followers_count,
                    (SELECT COUNT(*) FROM reposts r WHERE r.repost_user_fk = u.user_pk) AS reposts_count
                FROM users u
            ");
            DB::unprepared('DROP FUNCTION IF EXISTS user_total_engagements');
            DB::unprepared("
                CREATE FUNCTION user_total_engagements(p_user_pk CHAR(50))
                RETURNS INT
                DETERMINISTIC
                READS SQL DATA
                BEGIN
                    DECLARE total INT;
                    SELECT
                        (SELECT COUNT(*) FROM posts p WHERE p.post_user_fk = p_user_pk) +
                        (SELECT COUNT(*) FROM comments c WHERE c.comment_user_fk = p_user_pk) +
                        (SELECT COUNT(*) FROM likes l WHERE l.like_user_fk = p_user_pk) +
                        (SELECT COUNT(*) FROM reposts r WHERE r.repost_user_fk = p_user_pk)
                    INTO total;
                    RETURN total;
                END
            ");
        } else {
            DB::unprepared('DROP VIEW IF EXISTS user_engagements');
            DB::unprepared("
                CREATE VIEW user_engagements AS
                SELECT
                    u.user_pk,
                    u.user_username,
                    u.user_full_name,
                    (SELECT COUNT(*) FROM posts p WHERE p.post_user_fk = u.user_pk) AS posts_count,
                    (SELECT COUNT(*) FROM comments c WHERE c.comment_user_fk = u.user_pk) AS comments_count,
                    (SELECT COUNT(*) FROM likes l WHERE l.like_user_fk = u.user_pk) AS likes_given,
                    (SELECT COUNT(*) FROM likes l2 JOIN posts p2 ON l2.like_post_fk = p2.post_pk WHERE p2.post_user_fk = u.user_pk) AS likes_received,
                    (SELECT COUNT(*) FROM follows f WHERE f.follower_user_fk = u.user_pk) AS following_count,
                    (SELECT COUNT(*) FROM follows f WHERE f.followed_user_fk = u.user_pk) AS followers_count,
                    (SELECT COUNT(*) FROM reposts r WHERE r.repost_user_fk = u.user_pk) AS reposts_count
                FROM users u
            ");
        }
        if ($driver === 'mysql') {
            DB::unprepared('DROP TRIGGER IF EXISTS comment_events_after_insert');
            DB::unprepared("
                CREATE TRIGGER comment_events_after_insert
                AFTER INSERT ON comments
                FOR EACH ROW
                BEGIN
                    INSERT INTO comment_events (comment_pk, event_type, created_at)
                    VALUES (NEW.comment_pk, 'insert', NOW());
                END
            ");
        } else {
            DB::unprepared('DROP TRIGGER IF EXISTS comment_events_after_insert');
            DB::unprepared("
                CREATE TRIGGER comment_events_after_insert
                AFTER INSERT ON comments
                BEGIN
                    INSERT INTO comment_events (comment_pk, event_type, created_at)
                    VALUES (NEW.comment_pk, 'insert', CURRENT_TIMESTAMP);
                END
            ");
        }
        if ($driver === 'mysql') {
            DB::unprepared('DROP PROCEDURE IF EXISTS record_repost_with_audit');
            DB::unprepared("
                CREATE PROCEDURE record_repost_with_audit(IN p_user_pk CHAR(50), IN p_post_pk CHAR(50))
                BEGIN
                    START TRANSACTION;
                        INSERT IGNORE INTO reposts (repost_pk, repost_post_fk, repost_user_fk, created_at, updated_at)
                        VALUES (UUID(), p_post_pk, p_user_pk, NOW(), NOW());
                        INSERT INTO repost_audits (repost_pk, user_pk, post_pk, created_at)
                        VALUES (UUID(), p_user_pk, p_post_pk, NOW());
                    COMMIT;
                END
            ");
            DB::unprepared('DROP EVENT IF EXISTS prune_old_tokens');
            DB::unprepared("
                CREATE EVENT prune_old_tokens
                ON SCHEDULE EVERY 1 DAY
                DO
                  DELETE FROM personal_access_tokens
                  WHERE last_used_at IS NOT NULL
                    AND last_used_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
            ");
        }
    }
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('posts_user_created_idx');
        });
        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex('comments_post_idx');
            $table->dropIndex('comments_user_idx');
        });
        Schema::table('likes', function (Blueprint $table) {
            $table->dropIndex('likes_post_idx');
            $table->dropIndex('likes_user_idx');
        });
        Schema::table('reposts', function (Blueprint $table) {
            $table->dropIndex('reposts_user_idx');
            $table->dropIndex('reposts_post_idx');
        });
        Schema::table('follows', function (Blueprint $table) {
            $table->dropIndex('follows_followed_idx');
            $table->dropIndex('follows_follower_idx');
        });
        $driver = DB::getDriverName();
        DB::unprepared('DROP VIEW IF EXISTS user_engagements');
        DB::unprepared('DROP TRIGGER IF EXISTS comment_events_after_insert');
        if ($driver === 'mysql') {
            DB::unprepared('DROP PROCEDURE IF EXISTS record_repost_with_audit');
            DB::unprepared('DROP EVENT IF EXISTS prune_old_tokens');
            DB::unprepared('DROP FUNCTION IF EXISTS user_total_engagements');
        }
        Schema::dropIfExists('comment_events');
        Schema::dropIfExists('repost_audits');
    }
};
