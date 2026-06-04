<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatParteVehiculo extends Model
{
    protected $table      = 'RAT_CAT_PARTE_VEHICULO';
    public    $timestamps = false;
    protected $fillable   = ['zona_id', 'tipo_vehiculo', 'subzona', 'nombre'];

    public function zona()
    {
        return $this->belongsTo(CatZonaVehiculo::class, 'zona_id');
    }
}
