<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class HuellaEscena extends Model
{
    protected $table      = 'RAT_HUELLA_ESCENA';
    public    $timestamps = false;

    protected $fillable = [
        'ubicacion_via_id', 'tipo_indicio_id',
        'longitud_frenado_m', 'longitud_derrape_m',
        'mu_corregido_derrape', 'descripcion_indicio',
    ];

    public function ubicacionVia() { return $this->belongsTo(UbicacionVia::class,  'ubicacion_via_id'); }
    public function tipoIndicio()  { return $this->belongsTo(CatTipoIndicio::class, 'tipo_indicio_id'); }
}
