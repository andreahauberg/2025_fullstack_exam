<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'post_pk';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'post_pk',
        'post_content',
        'post_user_fk',
        'post_image_path',
    ];

    protected $dates = ['deleted_at'];

public function user()
{
    return $this->belongsTo(User::class, 'post_user_fk', 'user_pk')->withDefault([
        'user_full_name' => 'Deleted User',
        'user_username' => 'deleted',
    ]);
}


    public function likes()
    {
        return $this->hasMany(Like::class, 'like_post_fk', 'post_pk');
    }

    public function reposts()
    {
        return $this->hasMany(Repost::class, 'repost_post_fk', 'post_pk');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'comment_post_fk', 'post_pk');
    }
}
