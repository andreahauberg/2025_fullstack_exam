<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Follow extends Model
{
    protected $primaryKey = null;
    public $incrementing = false;
    protected $table = 'follows';
    public $timestamps = false; 
    protected $fillable = [
        'follower_user_fk',
        'followed_user_fk',
    ];
}
