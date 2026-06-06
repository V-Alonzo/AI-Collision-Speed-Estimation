<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class Incidente extends Model
{
    use HasUuid;

    protected $table    = 'RAT_INCIDENTE';
    protected $fillable = [
        'uuid', 'numero_siniestro', 'fecha_hecho', 'hora_hecho',
        'tipo_hecho_id', 'id_usuario_perito', 'estado',
    ];

    protected $casts = [
        'fecha_hecho' => 'date',
        'estado'      => 'integer',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    public function tipoHecho()   { return $this->belongsTo(CatTipoHecho::class, 'tipo_hecho_id'); }
    public function ubicacionVia(){ return $this->hasOne(UbicacionVia::class,    'incidente_id'); }
    public function vehiculos()   { return $this->hasMany(IncidenteVehiculo::class, 'incidente_id'); }
    public function reportes()    { return $this->hasMany(Reporte::class,         'incidente_id'); }
}
