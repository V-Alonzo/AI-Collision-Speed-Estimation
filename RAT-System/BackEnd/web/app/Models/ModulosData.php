<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModulosData extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'view_modulos_user';
    

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id_modulo', 'title', 'icon', 'url', 'status', 'rate' ,'id_keycloak'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}