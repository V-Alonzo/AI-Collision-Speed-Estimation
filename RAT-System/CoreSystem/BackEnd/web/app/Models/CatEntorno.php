<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatEntorno extends Model
{
    protected $table = 'cat_entornos';
    
    protected $fillable = [
        'clima',
        'tipo_via',
        'superficie',
        'iluminacion',
        'visibilidad',
        'observaciones'
    ];
}
