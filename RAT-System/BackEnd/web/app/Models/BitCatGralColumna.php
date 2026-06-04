<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BitCatGralColumna extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bit_cat_grales_columnas';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id_cat_gral_columna';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id_cat_gral',
        'solo_cesvi',
        'columna',
        'name',
        'label',
        'preholder',
        'descripcion',
        'tipo_columna',
        'cat_opciones',
        'cat_opciones_value',
        'cat_opciones_label',
        'requerido',
        'mensaje_reque',
        'max_length',
        'order',
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
        'max_length' => 'integer',
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationship: Belongs to BitCatGral
     */
    public function catalogo()
    {
        return $this->belongsTo(BitCatGral::class, 'id_cat_gral', 'id_cat_gral');
    }

    /**
     * Obtener las opciones dinámicamente desde la tabla especificada en cat_opciones
     * Formatea las opciones para Ant Design Select (value, label)
     * 
     * @return array
     */
    public function getOpciones()
    {
        if (empty($this->cat_opciones)) {
            return [];
        }

        // Caso especial: si contiene comas, dividir y formatear como opciones
        if (strpos($this->cat_opciones, ',') !== false) {
            $valores = explode(',', $this->cat_opciones);
            return collect($valores)->map(function($valor) {
                $valor = trim($valor);
                return [
                    'value' => $valor,
                    'label' => ucfirst($valor), // Primera letra mayúscula
                ];
            })->toArray();
        }

 
        // Campos por defecto si no están especificados
        $valueField = $this->cat_opciones_value ?? 'id';
        $labelField = $this->cat_opciones_label ?? 'name';

        try {
            // Obtener datos de la tabla especificada con filtro de status
            $query = \DB::table($this->cat_opciones)
                ->select($valueField, $labelField);

            // Agregar filtro por status si la tabla tiene esa columna
            if (\Schema::hasColumn($this->cat_opciones, 'status')) {
                $query->where('status', 'alta');
            }

            $opciones = $query->get();

            // Mapear a formato Ant Design {value, label}
            return $opciones->map(function($opcion) use ($valueField, $labelField) {
                return [
                    'value' => $opcion->$valueField,
                    'label' => $opcion->$labelField,
                ];
            })->toArray();

        } catch (\Exception $e) {
            \Log::error("Error obteniendo opciones de {$this->cat_opciones}: " . $e->getMessage());
            return [];
        }
    }
}
