<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class PlantillaSeccion extends Model
{
    protected $table      = 'RAT_PLANTILLA_SECCION';
    public    $timestamps = false;

    protected $fillable = [
        'plantilla_id', 'numero_seccion', 'titulo', 'orden', 'es_visible',
    ];

    protected $casts = ['es_visible' => 'boolean'];

    public function plantilla()
    {
        return $this->belongsTo(Plantilla::class, 'plantilla_id');
    }

    public function parrafos()
    {
        return $this->hasMany(PlantillaParrafo::class, 'seccion_id');
    }
}
