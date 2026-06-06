<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatConstantes extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cat_constantes';
      /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_constante';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    // protected $fillable = [
    //     'id_user',   'id_keycloak', 'preferred_username', 'email', 'given_name', 'family_name', 'name', 'status', 'id_company', 'id_rol', 'created_at', 'updated_at'
    // ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
    protected $guarded = [];  
}