<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatDireccionDano extends Model
{
    protected $table      = 'RAT_CAT_DIRECCION_DANO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
