<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatCondicionSuperficie extends Model
{
    protected $table      = 'RAT_CAT_CONDICION_SUPERFICIE';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
