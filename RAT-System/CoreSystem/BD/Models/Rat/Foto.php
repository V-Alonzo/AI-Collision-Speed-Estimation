<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class Foto extends Model
{
    protected $table      = 'RAT_FOTO';
    public    $timestamps = false;

    protected $fillable = [
        'incidente_vehiculo_id', 'tipo_foto_id',
        'url', 'descripcion', 'tomada_en',
    ];

    protected $casts = [
        'tomada_en' => 'datetime',
    ];

    public function incidenteVehiculo() { return $this->belongsTo(IncidenteVehiculo::class, 'incidente_vehiculo_id'); }
    public function tipoFoto()          { return $this->belongsTo(CatTipoFoto::class,        'tipo_foto_id'); }
}
