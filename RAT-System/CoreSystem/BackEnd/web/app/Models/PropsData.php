<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropsData extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'view_props_data';
    //protected $table = 'cat_formcomponentes';
      /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'table_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    // protected $fillable = [
    //     'id',   'label', 'name', 'tipo', 'placeholder', 'required', 'message', 
    // ];

//    protected $fillable = [
//        'data_table_id', 'name_table', 'component_no', 'name_element', 'name_attribute_column', 'value', 'order', 'type', 'module', 
//    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}