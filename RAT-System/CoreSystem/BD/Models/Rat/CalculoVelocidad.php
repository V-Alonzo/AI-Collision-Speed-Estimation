<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CalculoVelocidad extends Model
{
    protected $table      = 'RAT_CALCULO_VELOCIDAD';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id',
        'categoria_mchenry', 'a_rigidez_n_m', 'b_rigidez_n_m2',
        'e_deformacion_julios', 'e_def_corregida_julios',
        'aplica_vuelco', 'angulo_vuelco_grados', 'hipotenusa_vuelco_m',
        'h_altura_critica_m', 'centro_gravedad_m',
        'e_vuelco_julios', 'e_total_julios',
        'ebs_m_s', 'velocidad_impacto_kmh',
        'dmed_m', 'velocidad_limpert_kmh', 'vel_limpert_margenerror_kmh',
        'e_frenado_julios', 'velocidad_pre_impacto_kmh',
        'tiempo_frenos_id', 'tiempo_respuesta_frenos_s',
        'velocidad_final_kmh', 'exceso_velocidad',
        'delta_exceso_kmh', 'margen_error_kmh',
    ];

    protected $casts = [
        'aplica_vuelco'   => 'boolean',
        'exceso_velocidad'=> 'boolean',
    ];

    public function incidenteVehiculo() { return $this->belongsTo(IncidenteVehiculo::class, 'incidente_vehiculo_id'); }
    public function tiempoFreno()       { return $this->belongsTo(TablaTiempoFreno::class,  'tiempo_frenos_id'); }
}
