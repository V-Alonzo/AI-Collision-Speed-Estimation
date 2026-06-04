<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatPuntoClave extends Model
{
    protected $table      = 'RAT_CAT_PUNTO_CLAVE';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
