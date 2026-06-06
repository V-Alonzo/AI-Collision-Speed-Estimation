<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatTipoGolpe extends Model
{
    protected $table      = 'RAT_CAT_TIPO_GOLPE';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
