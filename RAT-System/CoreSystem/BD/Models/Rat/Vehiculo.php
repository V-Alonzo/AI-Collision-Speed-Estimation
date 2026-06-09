<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    use HasUuid;

    protected $table    = 'RAT_VEHICULO';
    protected $fillable = [
        'uuid', 'vin', 'tipo_clase', 'marca', 'submarca', 'nombre_modelo',
        'anio_modelo', 'tipo_vehiculo', 'peso_tara_kg', 'masa_maxima_autorizada_kg',
        'ancho_mm', 'largo_mm', 'alto_mm', 'batalla_mm',
        'voladizo_anterior_mm', 'voladizo_posterior_mm',
        'entrevia_delantera_mm', 'entrevia_trasera_mm',
        'redondez_vertices_mm', 'centro_gravedad_m',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function incidentes()
    {
        return $this->hasMany(IncidenteVehiculo::class, 'vehiculo_id');
    }
}
