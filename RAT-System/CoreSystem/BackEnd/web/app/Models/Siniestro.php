<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Siniestro extends Model
{
    use SoftDeletes;

    protected $table = 'siniestros';
    protected $fillable = [
        'numero_siniestro',
        'fecha_hora_siniestro',
        'tipo_accidente',
        'ubicacion_calle',
        'ubicacion_ciudad',
        'ubicacion_lat',
        'ubicacion_lng',
        'descripcion_detallada',
        'perito_nombre',
        'perito_cedula',
        'perito_email',
        'estado',
        'porcentaje_avance',
        'cat_entorno_id'
    ];

    protected $casts = [
        'fecha_hora_siniestro' => 'datetime',
        'porcentaje_avance' => 'integer',
        'ubicacion_lat' => 'float',
        'ubicacion_lng' => 'float'
    ];

    public function catEntorno()
    {
        return $this->belongsTo(CatEntorno::class);
    }

    public function evidenciaFotos()
    {
        return $this->hasMany(EvidenciaFoto::class);
    }

    public function iaResultados()
    {
        return $this->hasMany(IaResultado::class);
    }
}
