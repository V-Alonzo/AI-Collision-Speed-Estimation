<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class PlantillaParrafo extends Model
{
    protected $table      = 'RAT_PLANTILLA_PARRAFO';
    public    $timestamps = false;

    protected $fillable = [
        'seccion_id', 'orden', 'tipo',
        'contenido_fijo', 'fuente_variable', 'condicion',
    ];

    public function seccion()
    {
        return $this->belongsTo(PlantillaSeccion::class, 'seccion_id');
    }
}
