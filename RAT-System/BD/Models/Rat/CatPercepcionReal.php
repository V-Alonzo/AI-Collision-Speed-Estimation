<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatPercepcionReal extends Model
{
    protected $table      = 'RAT_CAT_PERCEPCION_REAL';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
