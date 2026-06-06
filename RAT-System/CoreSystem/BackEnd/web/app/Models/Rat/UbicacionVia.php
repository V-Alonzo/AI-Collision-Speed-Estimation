<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class UbicacionVia extends Model
{
    use HasUuid;

    protected $table      = 'RAT_UBICACION_VIA';
    public    $timestamps = false;

    protected $fillable = [
        'uuid', 'incidente_id', 'calle', 'numero_exterior', 'colonia',
        'codigo_postal', 'municipio', 'estado_republica', 'pais',
        'referencia_adicional', 'km_punto', 'lat', 'lng',
        'velocidad_maxima_permitida_kmh', 'tipo_via_id', 'tipo_trazo_id',
        'tipo_interseccion_id', 'senalamiento_vertical_id', 'senalamiento_horizontal_id',
        'medidas_via_m', 'orientacion_id', 'sentido_vialidad_id',
        'condicion_superficie_id', 'condicion_pavimento_id', 'tipo_pavimento_id', 'clima_id',
        'mu_coeficiente_adherencia', 'inclinacion_pct', 'mu_corregido',
        'radio_curva_m', 'peraltaje_pct',
    ];

    public function incidente()            { return $this->belongsTo(Incidente::class,               'incidente_id'); }
    public function tipoVia()              { return $this->belongsTo(CatTipoVia::class,               'tipo_via_id'); }
    public function tipoTrazo()            { return $this->belongsTo(CatTipoTrazo::class,             'tipo_trazo_id'); }
    public function tipoInterseccion()     { return $this->belongsTo(CatTipoInterseccion::class,      'tipo_interseccion_id'); }
    public function senalamientoVertical() { return $this->belongsTo(CatSenalamientoVertical::class,  'senalamiento_vertical_id'); }
    public function senalamientoHorizontal(){ return $this->belongsTo(CatSenalamientoHorizontal::class,'senalamiento_horizontal_id'); }
    public function orientacion()          { return $this->belongsTo(CatOrientacionVia::class,        'orientacion_id'); }
    public function sentidoVialidad()      { return $this->belongsTo(CatSentidoVialidad::class,       'sentido_vialidad_id'); }
    public function condicionSuperficie()  { return $this->belongsTo(CatCondicionSuperficie::class,   'condicion_superficie_id'); }
    public function condicionPavimento()   { return $this->belongsTo(CatCondicionPavimento::class,    'condicion_pavimento_id'); }
    public function tipoPavimento()        { return $this->belongsTo(CatTipoPavimento::class,         'tipo_pavimento_id'); }
    public function clima()                { return $this->belongsTo(CatClima::class,                 'clima_id'); }
    public function huellas()              { return $this->hasMany(HuellaEscena::class,               'ubicacion_via_id'); }
}
