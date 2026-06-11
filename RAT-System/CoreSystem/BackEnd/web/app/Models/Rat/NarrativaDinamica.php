<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class NarrativaDinamica extends Model
{
    protected $table      = 'RAT_NARRATIVA_DINAMICA';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id', 'narracion_hechos', 'objeto_involucrado',
        'descripcion_objeto_fijo', 'posicion_final_vehiculo', 'direccion_circulacion',
        'distancia_ppr_al_pc_m', 'tiempo_reaccion_conductor_s',
        'huellas_frenado_m', 'huellas_derrape_m',
    ];

    public function incidenteVehiculo()
    {
        return $this->belongsTo(IncidenteVehiculo::class, 'incidente_vehiculo_id');
    }
}
