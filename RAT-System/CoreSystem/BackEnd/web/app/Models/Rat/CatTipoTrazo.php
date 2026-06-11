<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatTipoTrazo extends Model
{
    protected $table      = 'RAT_CAT_TIPO_TRAZO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
