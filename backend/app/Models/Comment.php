<?php

namespace App\Models;
use App\Models\User;
use App\Models\Post;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'comment_pk';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'comment_pk',
        'comment_message',
        'comment_post_fk',
        'comment_user_fk',
    ];

    protected $dates = ['deleted_at'];

    public function user()
    {
        return $this->belongsTo(User::class, 'comment_user_fk', 'user_pk')->withDefault([
            'user_full_name' => 'Deleted User',
            'user_username' => 'deleted',
        ]);
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'comment_post_fk', 'post_pk');
    }
}

