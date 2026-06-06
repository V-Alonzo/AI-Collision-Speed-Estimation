<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormData extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'view_form_data';
    //protected $table = 'cat_formcomponentes';
      /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'data_form_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    // protected $fillable = [
    //     'id',   'label', 'name', 'tipo', 'placeholder', 'required', 'message', 
    // ];

    protected $fillable = [
        'data_form_id', 'name_form', 'component_no', 'name_element', 'name_attribute', 'value', 'order', 'dependency', 'type', 'module', 
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}