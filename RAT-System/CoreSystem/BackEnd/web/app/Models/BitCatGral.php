<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BitCatGral extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bit_cat_grales';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_cat_gral';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'catalogo',
        'codigo_access',
        'tabla',
        'campo_primario',
        'no_columnas',
        'status',
        'created_at',
        'updated_at'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'no_columnas' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship: One to Many with BitCatGralColumna
     * Especificamos explícitamente las claves porque no siguen la convención estándar de Laravel
     * Parámetros: (modelo, clave_foránea, clave_local)
     */
    public function columnas()
    {
        return $this->hasMany(BitCatGralColumna::class, 'id_cat_gral', 'id_cat_gral')->orderBy('order');
    }
}
