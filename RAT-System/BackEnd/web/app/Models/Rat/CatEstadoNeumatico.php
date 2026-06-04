<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatEstadoNeumatico extends Model
{
    protected $table      = 'RAT_CAT_ESTADO_NEUMATICO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
