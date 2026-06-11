<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatTipoDano extends Model
{
    protected $table      = 'RAT_CAT_TIPO_DANO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
