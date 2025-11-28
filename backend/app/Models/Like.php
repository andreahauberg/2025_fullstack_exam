<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $primaryKey = 'like_pk';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'like_pk',
        'like_post_fk',
        'like_user_fk',
    ];

    // Relation til Post
    public function post()
    {
        return $this->belongsTo(Post::class, 'like_post_fk', 'post_pk');
    }

    // Relation til User
    public function user()
    {
        return $this->belongsTo(User::class, 'like_user_fk', 'user_pk');
    }
}
