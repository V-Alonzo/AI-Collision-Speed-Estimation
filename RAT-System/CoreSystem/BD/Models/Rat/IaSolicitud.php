<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class IaSolicitud extends Model
{
    protected $table      = 'RAT_IA_SOLICITUD';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id', 'incidente_id', 'user_id',
        'tipo', 'estado',
        'contexto_json', 'prompt_enviado',
        'respuesta_ia', 'texto_sugerido', 'texto_final', 'fue_editado',
        'tokens_entrada', 'tokens_salida', 'latencia_ms',
        'detalle_error', 'created_at', 'respondido_en',
    ];

    protected $casts = [
        'contexto_json'  => 'array',
        'respuesta_ia'   => 'array',
        'fue_editado'    => 'boolean',
        'created_at'     => 'datetime',
        'respondido_en'  => 'datetime',
    ];

    // Tipos de IA disponibles (coinciden con CHECK de la BD)
    const TIPO_AUTOCOMPLETAR_VEHICULO  = 'autocompletar_vehiculo';
    const TIPO_SUGERENCIA_DEFORMACION  = 'sugerencia_deformacion';
    const TIPO_NARRATIVA_DINAMICA      = 'narrativa_dinamica';

    // Estados posibles
    const ESTADO_PENDIENTE   = 'pendiente';
    const ESTADO_COMPLETADO  = 'completado';
    const ESTADO_ERROR       = 'error';
    const ESTADO_RECHAZADO   = 'rechazado';
    const ESTADO_ACEPTADO    = 'aceptado';

    public function incidenteVehiculo()
    {
        return $this->belongsTo(IncidenteVehiculo::class, 'incidente_vehiculo_id');
    }

    public function incidente()
    {
        return $this->belongsTo(Incidente::class, 'incidente_id');
    }
}
