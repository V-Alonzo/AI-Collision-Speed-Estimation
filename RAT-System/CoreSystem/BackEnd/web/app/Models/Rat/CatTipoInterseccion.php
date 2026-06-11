<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatTipoInterseccion extends Model
{
    protected $table      = 'RAT_CAT_TIPO_INTERSECCION';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
