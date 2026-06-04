<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermisosData extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sys_permissions';
       /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'permission_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'permission_id', 'keycloak_id', 'menu_id', 'user_id',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}