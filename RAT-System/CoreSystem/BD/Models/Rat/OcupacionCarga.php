<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class OcupacionCarga extends Model
{
    protected $table      = 'RAT_OCUPACION_CARGA';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id', 'numero_ocupantes',
        'peso_conductor_kg', 'peso_pasajeros_kg',
        'peso_equipaje_kg', 'masa_total_kg',
    ];

    public function incidenteVehiculo()
    {
        return $this->belongsTo(IncidenteVehiculo::class, 'incidente_vehiculo_id');
    }
}
