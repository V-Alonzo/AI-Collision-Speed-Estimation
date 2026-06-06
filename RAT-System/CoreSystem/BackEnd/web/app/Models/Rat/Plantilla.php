<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class Plantilla extends Model
{
    protected $table      = 'RAT_PLANTILLA';
    public    $timestamps = false;

    protected $fillable = ['tipo_documento', 'version', 'activa', 'descripcion'];
    protected $casts    = [
        'activa'     => 'boolean',
        'created_at' => 'datetime',
    ];

    public function secciones()
    {
        return $this->hasMany(PlantillaSeccion::class, 'plantilla_id');
    }
}
