<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class PlantillaVariable extends Model
{
    protected $table      = 'RAT_PLANTILLA_VARIABLE';
    public    $timestamps = false;

    protected $fillable = [
        'clave', 'descripcion', 'tabla_origen', 'columna_origen', 'formato',
    ];
}
