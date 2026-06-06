<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class PrincipiosForenses extends Model
{
    protected $table      = 'RAT_PRINCIPIOS_FORENSES';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id',
        'principio_intercambio_materiales',
        'principio_correspondencia',
        'dinamica_colision_fases',
    ];

    public function incidenteVehiculo()
    {
        return $this->belongsTo(IncidenteVehiculo::class, 'incidente_vehiculo_id');
    }

    public function conclusiones()
    {
        return $this->hasMany(Conclusion::class, 'principios_forenses_id');
    }
}
