<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\TrendingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\RepostController;
use App\Http\Controllers\NotificationsController;
use Illuminate\Http\Request;
use App\Http\Controllers\SearchController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']); 
Route::post('/logout', [AuthController::class, 'logout']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{post_pk}', [PostController::class, 'update']);
    Route::delete('/posts/{post_pk}', [PostController::class, 'destroy']);
    Route::get('/users/{userPk}/posts', [PostController::class, 'userPosts']);
    Route::post('/likes', [LikeController::class, 'store']);
    Route::delete('/likes/{post_pk}', [LikeController::class, 'destroy']);
    Route::post('/reposts', [RepostController::class, 'store']);
    Route::delete('/reposts/{post_pk}', [RepostController::class, 'destroy']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment_pk}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment_pk}', [CommentController::class, 'destroy']);
    Route::get('/trending', [TrendingController::class, 'index']);
    Route::get('/users-to-follow', [UserController::class, 'usersToFollow']);
    Route::post('/follows', [FollowController::class, 'store']);
    Route::delete('/follows/{followed_user_fk}', [FollowController::class, 'destroy']);
    Route::get('/users/{userPk}', [UserController::class, 'show']);
    Route::put('/users/{userPk}', [UserController::class, 'update']);
    Route::post('users/{userPk}/profile-picture', [UserController::class, 'uploadProfilePicture']);
    Route::post('users/{userPk}/cover-picture', [UserController::class, 'uploadCoverPicture']);
    Route::delete('/users/{userPk}', [UserController::class, 'destroy']);
    Route::get('/users/{userPk}/reposts', [PostController::class, 'userReposts']);
    Route::post('/search', [SearchController::class, 'search'])->middleware('auth:sanctum');
    Route::get('/notifications', [NotificationsController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationsController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationsController::class, 'destroy']);
    Route::post('/notifications/read-all', [NotificationsController::class, 'markAllAsRead']);

});
