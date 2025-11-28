<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_pk';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_pk',
        'user_full_name',
        'user_username',
        'user_email',
        'user_password',
        'user_profile_picture',
        'user_cover_picture',
    ];

    protected $hidden = [
        'user_password',
        'remember_token',
    ];

    // Relation til posts
  public function posts()
{
    return $this->hasMany(Post::class, 'post_user_fk', 'user_pk');
}

    // Relation til likes
    public function likes()
    {
        return $this->hasMany(Like::class, 'like_user_fk', 'user_pk');
    }

    // Relation til comments
    public function comments()
    {
        return $this->hasMany(Comment::class, 'comment_user_fk', 'user_pk');
    }

    // Brugere som denne bruger følger
    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_user_fk', 'followed_user_fk');

    }

    // Brugere som følger denne bruger
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'followed_user_fk', 'follower_user_fk');

    }

    public function getAuthIdentifierName()
    {
        return 'user_pk';
    }

    public function getAuthIdentifier()
    {
        return $this->user_pk;
    }

    public function getKeyType()
    {
        return 'string';
    }
}
