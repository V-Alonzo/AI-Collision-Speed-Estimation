<?php

use App\Models\Rat\Incidente; 
namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLog extends Model
{
    protected $table      = 'audit_logs';
    public    $timestamps = false;

    protected $fillable = [
        'user_id', 'tabla_afectada', 'registro_id', 'registro_uuid',
        'campo_afectado', 'valor_anterior', 'valor_nuevo',
        'accion', 'ip_origen', 'user_agent', 'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    const ACCION_INSERT = 'INSERT';
    const ACCION_UPDATE = 'UPDATE';
    const ACCION_DELETE = 'DELETE';

    /**
     * Registra un evento de auditoría.
     * Llamar desde los controladores antes o después de modificar datos sensibles.
     *
     * Ejemplo de uso:
     *   AuditLog::registrar(
     *       userId: auth()->id(),
     *       tabla: 'RAT_CALCULO_VELOCIDAD',
     *       registroId: $calculo->id,
     *       accion: AuditLog::ACCION_UPDATE,
     *       campo: 'velocidad_final_kmh',
     *       valorAnterior: $old,
     *       valorNuevo: $new,
     *       request: $request
     *   );
     */
    public static function registrar(
        int     $userId,
        string  $tabla,
        int     $registroId,
        string  $accion,
        ?string $campo         = null,
        mixed   $valorAnterior = null,
        mixed   $valorNuevo    = null,
        ?string $registroUuid  = null,
        ?Request $request      = null
    ): self {
        return static::create([
            'user_id'        => $userId,
            'tabla_afectada' => $tabla,
            'registro_id'    => $registroId,
            'registro_uuid'  => $registroUuid,
            'campo_afectado' => $campo,
            'valor_anterior' => $valorAnterior !== null ? (string) $valorAnterior : null,
            'valor_nuevo'    => $valorNuevo    !== null ? (string) $valorNuevo    : null,
            'accion'         => $accion,
            'ip_origen'      => $request?->ip(),
            'user_agent'     => $request?->userAgent(),
            'created_at'     => now(),
        ]);
    }
}
