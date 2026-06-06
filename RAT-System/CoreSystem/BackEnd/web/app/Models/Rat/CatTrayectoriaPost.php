<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatTrayectoriaPost extends Model
{
    protected $table      = 'RAT_CAT_TRAYECTORIA_POST';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
