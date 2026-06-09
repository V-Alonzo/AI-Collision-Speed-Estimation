<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuData extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'view_sys_menu';
    

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    // protected $fillable = [
    //     'menu_id', 'key', 'label', 'icon', 'orden', 'keycloak_id'
    // ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}