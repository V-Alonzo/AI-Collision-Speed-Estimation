<?php

namespace App\Models\Rat;
use App\Models\UserData;
use Illuminate\Database\Eloquent\Model;

class Conclusion extends Model
{
    protected $table      = 'RAT_CONCLUSION';
    public    $timestamps = false;

    protected $fillable = [
        'principios_forenses_id', 'orden', 'texto_conclusion',
        'validado_perito', 'validado_por_id', 'validado_en',
    ];

    protected $casts = [
        'validado_perito' => 'boolean',
        'validado_en'     => 'datetime',
    ];

    public function principiosForenses()
    {
        return $this->belongsTo(PrincipiosForenses::class, 'principios_forenses_id');
    }

	public function validadoPor()
	{
    	return $this->belongsTo(UserData::class, 'validado_por_id', 'id_user');
	}


}
