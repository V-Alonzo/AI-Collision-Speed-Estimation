<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class TablaRigidezAb extends Model
{
    protected $table      = 'RAT_TABLA_RIGIDEZ_AB';
    public    $timestamps = false;

    protected $fillable = [
        'categoria_mchenry', 'batalla_min_m', 'batalla_max_m',
        'via_delantera_ref_m', 'longitud_ref_m', 'anchura_ref_m', 'tara_ref_kg',
        'tipo_golpe_id', 'a_rigidez_n_m', 'b_rigidez_n_m2',
    ];

    public function tipoGolpe()
    {
        return $this->belongsTo(CatTipoGolpe::class, 'tipo_golpe_id');
    }
}
