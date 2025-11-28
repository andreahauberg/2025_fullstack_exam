<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Repost extends Model
{
    use HasFactory;

    protected $primaryKey = 'repost_pk';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'repost_pk',
        'repost_post_fk',
        'repost_user_fk',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class, 'repost_post_fk', 'post_pk');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'repost_user_fk', 'user_pk');
    }
}
