<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;
use Illuminate\Contracts\Queue\ShouldQueue;

//this is using Laravels already build in notification system to create a notification when a new post is created

class NewPostNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Post $post)
    {
    }

    public function via($notifiable)
    {
        return ['database']; // save only in notifications table
    }

    public function toDatabase($notifiable)
    {
        // Ensure we fetch the author reliably using the foreign key.
        $author = $this->post->user ?? User::where('user_pk', $this->post->post_user_fk)->first();

        return [
            'post_pk'         => $this->post->post_pk,
            'author_pk'       => $author?->user_pk,
            'author_username' => $author?->user_username,
            'author_profile_picture' => $author?->user_profile_picture,
            'excerpt'         => Str::limit($this->post->post_content ?? '', 140),
            'post_created_at' => $this->post->created_at?->toDateTimeString() ?? now()->toDateTimeString(),
            'notified_at'     => now()->toDateTimeString(),
        ];
    }
}