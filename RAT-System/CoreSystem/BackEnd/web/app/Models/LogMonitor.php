<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogMonitor extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'log_monitor';
       /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_log';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'tipo', 'usuario', 'id_keycloak', 'consulta'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}