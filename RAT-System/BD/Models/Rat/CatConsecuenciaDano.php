<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatConsecuenciaDano extends Model
{
    protected $table      = 'RAT_CAT_CONSECUENCIA_DANO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
