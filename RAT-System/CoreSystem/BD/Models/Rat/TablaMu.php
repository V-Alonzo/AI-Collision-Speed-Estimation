<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class TablaMu extends Model
{
    protected $table      = 'RAT_TABLA_MU';
    public    $timestamps = false;

    protected $fillable = [
        'tipo_pavimento_id', 'condicion_superficie_id',
        'estado_neumatico_id', 'vel_min_kmh', 'vel_max_kmh', 'mu',
    ];

    public function tipoPavimento()      { return $this->belongsTo(CatTipoPavimento::class,      'tipo_pavimento_id'); }
    public function condicionSuperficie(){ return $this->belongsTo(CatCondicionSuperficie::class, 'condicion_superficie_id'); }
    public function estadoNeumatico()    { return $this->belongsTo(CatEstadoNeumatico::class,     'estado_neumatico_id'); }
}
