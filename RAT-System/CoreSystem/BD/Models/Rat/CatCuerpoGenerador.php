<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatCuerpoGenerador extends Model
{
    protected $table      = 'RAT_CAT_CUERPO_GENERADOR';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
