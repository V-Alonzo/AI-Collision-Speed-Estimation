<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IaResultado extends Model
{
    use SoftDeletes;

    protected $table = 'ia_resultados';
    protected $fillable = [
        'siniestro_id',
        'evidencia_foto_id',
        'metodo_calculo',
        'velocidad_calculada_kmh',
        'velocidad_minima_kmh',
        'velocidad_maxima_kmh',
        'margen_error_porcentaje',
        'confidence_score',
        'nivel_confianza',
        'validado_por_perito',
        'estado_validacion'
    ];

    protected $casts = [
        'validado_por_perito' => 'boolean',
        'confidence_score' => 'float'
    ];

    public function siniestro()
    {
        return $this->belongsTo(Siniestro::class);
    }

    public function evidenciaFoto()
    {
        return $this->belongsTo(EvidenciaFoto::class);
    }
}
