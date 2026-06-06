<?php

namespace App\Models\Rat;
use App\Models\UserData;
use Illuminate\Database\Eloquent\Model;

class Reporte extends Model
{
    use HasUuid;

    protected $table    = 'RAT_REPORTE';
    protected $fillable = [
        'uuid', 'incidente_id', 'id_usuario_perito',
        'numero_formato', 'tipo_documento', 'nivel_emergencia',
        'fecha_elaboracion', 'ubicacion_taller', 'ruta_documento_word',
        'estado', 'intentos_emision', 'fecha_inicio', 'fecha_emision',
    ];

    protected $casts = [
        'fecha_elaboracion' => 'date',
        'fecha_inicio'      => 'datetime',
        'fecha_emision'     => 'datetime',
        'estado'            => 'integer',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    public function incidente()
    {
        return $this->belongsTo(Incidente::class, 'incidente_id');
    }
	public function perito()
	{
    	return $this->belongsTo(UserData::class, 'id_usuario_perito', 'id_user');
	}


}
