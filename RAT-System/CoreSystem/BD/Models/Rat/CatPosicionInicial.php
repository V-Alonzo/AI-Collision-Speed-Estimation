<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatPosicionInicial extends Model
{
    protected $table      = 'RAT_CAT_POSICION_INICIAL';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
