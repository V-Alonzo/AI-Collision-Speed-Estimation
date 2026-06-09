<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatClima extends Model
{
    protected $table      = 'RAT_CAT_CLIMA';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
