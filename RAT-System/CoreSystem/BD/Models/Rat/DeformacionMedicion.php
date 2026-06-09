<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class DeformacionMedicion extends Model
{
    protected $table      = 'RAT_DEFORMACION_MEDICION';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id', 'tipo_golpe_id', 'numero_mediciones_id',
        'c1_m', 'c2_m', 'c3_m', 'c4_m', 'c5_m', 'c6_m',
        'l_ancho_contacto_m', 'angulo_fpi_grados',
        'arqueamiento_cm', 'linea_referencia_mm',
    ];

    public function incidenteVehiculo() { return $this->belongsTo(IncidenteVehiculo::class,   'incidente_vehiculo_id'); }
    public function tipoGolpe()         { return $this->belongsTo(CatTipoGolpe::class,         'tipo_golpe_id'); }
    public function numeroMediciones()  { return $this->belongsTo(CatNumeroMediciones::class,  'numero_mediciones_id'); }
}
