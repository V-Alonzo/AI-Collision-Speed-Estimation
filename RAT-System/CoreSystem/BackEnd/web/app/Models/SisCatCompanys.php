<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SisCatCompanys extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sys_cat_companys';
       /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_company';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    // protected $fillable = [
    //     'permission_id', 'keycloak_id', 'menu_id', 'user_id',
    // ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}