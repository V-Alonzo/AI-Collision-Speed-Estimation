<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class ModalidadDano extends Model
{
    protected $table      = 'RAT_MODALIDAD_DANO';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id', 'zona_vehiculo_id', 'parte_vehiculo_id',
        'tipo_dano_id', 'cuerpo_generador_id', 'direccion_dano_id',
        'consecuencia_id', 'descripcion_libre',
    ];

    public function incidenteVehiculo() { return $this->belongsTo(IncidenteVehiculo::class,  'incidente_vehiculo_id'); }
    public function zona()              { return $this->belongsTo(CatZonaVehiculo::class,     'zona_vehiculo_id'); }
    public function parte()             { return $this->belongsTo(CatParteVehiculo::class,    'parte_vehiculo_id'); }
    public function tipoDano()          { return $this->belongsTo(CatTipoDano::class,         'tipo_dano_id'); }
    public function cuerpoGenerador()   { return $this->belongsTo(CatCuerpoGenerador::class,  'cuerpo_generador_id'); }
    public function direccionDano()     { return $this->belongsTo(CatDireccionDano::class,    'direccion_dano_id'); }
    public function consecuencia()      { return $this->belongsTo(CatConsecuenciaDano::class, 'consecuencia_id'); }
}
