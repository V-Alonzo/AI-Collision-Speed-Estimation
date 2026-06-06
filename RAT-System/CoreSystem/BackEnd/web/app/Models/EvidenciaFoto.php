<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvidenciaFoto extends Model
{
    use SoftDeletes;

    protected $table = 'evidencia_fotos';
    protected $fillable = [
        'siniestro_id',
        'nombre_archivo',
        'url_s3',
        'parte_equipo',
        'fecha_captura',
        'estado_procesamiento',
        'id_tarea_ia'
    ];

    protected $casts = [
        'fecha_captura' => 'datetime'
    ];

    public function siniestro()
    {
        return $this->belongsTo(Siniestro::class);
    }

    public function iaResultados()
    {
        return $this->hasMany(IaResultado::class);
    }
}
