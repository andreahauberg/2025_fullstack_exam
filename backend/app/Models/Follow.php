<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Follow extends Model
{
    protected $primaryKey = null; // Hvis din tabel ikke har en auto-increment primary key
    public $incrementing = false;
    protected $table = 'follows'; // Sikr dig, at tabellen hedder 'follows'
    public $timestamps = false; 
    protected $fillable = [
        'follower_user_fk',
        'followed_user_fk',
    ];
}
