<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatZonaVehiculo extends Model
{
    protected $table      = 'RAT_CAT_ZONA_VEHICULO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];

    public function partes()
    {
        return $this->hasMany(CatParteVehiculo::class, 'zona_id');
    }
}
