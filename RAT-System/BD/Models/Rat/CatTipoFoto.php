<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatTipoFoto extends Model
{
    protected $table      = 'RAT_CAT_TIPO_FOTO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
