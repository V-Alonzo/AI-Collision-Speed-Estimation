<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatTipoVia extends Model
{
    protected $table      = 'RAT_CAT_TIPO_VIA';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
