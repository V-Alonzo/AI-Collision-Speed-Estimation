<?php

namespace App\Models\Rat;
use App\Models\UserData;
use Illuminate\Database\Eloquent\Model;

class PeritoPerfilModel extends Model
{
    protected $table      = 'RAT_PERITO_PERFIL';
    protected $primaryKey = 'id_user';
    public    $timestamps = false;
    public    $incrementing = false;

    protected $fillable = [
        'id_user', 'telefono', 'cedula_profesional', 'especialidad',
        'numero_empleado', 'calificacion', 'fecha_alta',
    ];

    protected $casts = [
        'calificacion' => 'decimal:1',
        'fecha_alta'   => 'date',
    ];

	public function user()
	{
    	return $this->belongsTo(UserData::class, 'id_user', 'id_user');
	}

}
