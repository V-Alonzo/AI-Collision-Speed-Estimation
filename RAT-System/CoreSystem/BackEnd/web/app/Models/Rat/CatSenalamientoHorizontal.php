<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatSenalamientoHorizontal extends Model
{
    protected $table      = 'RAT_CAT_SENALAMIENTO_HORIZONTAL';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
