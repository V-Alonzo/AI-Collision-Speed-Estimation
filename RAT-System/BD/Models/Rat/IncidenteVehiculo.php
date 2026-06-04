<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class IncidenteVehiculo extends Model
{
    use HasUuid;

    protected $table    = 'RAT_INCIDENTE_VEHICULO';
    protected $fillable = [
        'uuid', 'incidente_id', 'vehiculo_id',
        'numero_placas', 'color_id', 'estado_neumatico_id', 'rol',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Hacia arriba
    public function incidente()       { return $this->belongsTo(Incidente::class,          'incidente_id'); }
    public function vehiculo()        { return $this->belongsTo(Vehiculo::class,            'vehiculo_id'); }
    public function color()           { return $this->belongsTo(CatColor::class,            'color_id'); }
    public function estadoNeumatico() { return $this->belongsTo(CatEstadoNeumatico::class,  'estado_neumatico_id'); }

    // Hacia abajo (1:1)
    public function ocupacionCarga()       { return $this->hasOne(OcupacionCarga::class,       'incidente_vehiculo_id'); }
    public function deformacionMedicion()  { return $this->hasOne(DeformacionMedicion::class,  'incidente_vehiculo_id'); }
    public function calculoVelocidad()     { return $this->hasOne(CalculoVelocidad::class,      'incidente_vehiculo_id'); }
    public function faseAccidente()        { return $this->hasOne(FaseAccidente::class,         'incidente_vehiculo_id'); }
    public function narrativaDinamica()    { return $this->hasOne(NarrativaDinamica::class,     'incidente_vehiculo_id'); }
    public function principiosForenses()   { return $this->hasOne(PrincipiosForenses::class,    'incidente_vehiculo_id'); }

    // 1:N
    public function fotos()          { return $this->hasMany(Foto::class,          'incidente_vehiculo_id'); }
    public function modalidadesDano() { return $this->hasMany(ModalidadDano::class, 'incidente_vehiculo_id'); }
    public function solicitudesIa()  { return $this->hasMany(IaSolicitud::class,   'incidente_vehiculo_id'); }
}
