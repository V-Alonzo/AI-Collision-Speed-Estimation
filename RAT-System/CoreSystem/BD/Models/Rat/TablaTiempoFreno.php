<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class TablaTiempoFreno extends Model
{
    protected $table      = 'RAT_TABLA_TIEMPO_FRENOS';
    public    $timestamps = false;
    protected $fillable   = ['eficacia_pct', 'tiempo_s'];
}
