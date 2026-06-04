<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class FaseAccidente extends Model
{
    protected $table      = 'RAT_FASE_ACCIDENTE';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id', 'posicion_inicial_id', 'percepcion_real_id',
        'factores_percepcion', 'punto_clave_id', 'factores_punto_clave',
        'zona_impacto_id', 'trayectoria_post_id',
    ];

    public function incidenteVehiculo() { return $this->belongsTo(IncidenteVehiculo::class,  'incidente_vehiculo_id'); }
    public function posicionInicial()   { return $this->belongsTo(CatPosicionInicial::class,  'posicion_inicial_id'); }
    public function percepcionReal()    { return $this->belongsTo(CatPercepcionReal::class,   'percepcion_real_id'); }
    public function puntoClave()        { return $this->belongsTo(CatPuntoClave::class,       'punto_clave_id'); }
    public function zonaImpacto()       { return $this->belongsTo(CatZonaVehiculo::class,     'zona_impacto_id'); }
    public function trayectoriaPost()   { return $this->belongsTo(CatTrayectoriaPost::class,  'trayectoria_post_id'); }
}
