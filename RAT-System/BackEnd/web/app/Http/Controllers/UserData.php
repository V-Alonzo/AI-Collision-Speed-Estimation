<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Rat\PeritoPerfilModel;
use App\Models\Rat\Incidente;
use App\Models\Rat\Reporte;
use App\Models\Rat\Conclusion;
use App\Models\Rat\JwtToken;
use App\Models\Rat\AuditLog;
use App\Models\Rat\IaSolicitud;

class UserData extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * La tabla asociada al modelo.
     *
     * @var string
     */
    protected $table = 'sys_users';

    /**
     * La llave primaria de la tabla.
     *
     * @var string
     */
    protected $primaryKey = 'id_user';

    /**
     * Indica si la llave primaria es auto-incremental.
     *
     * @var bool
     */
    public $incrementing = true;

    /**
     * El tipo de dato de la llave primaria.
     *
     * @var string
     */
    protected $keyType = 'int';

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id_user',
        'name',
        'email',
        'password',
        'code_activacion',
        'date_code_activacion',
        'id_keycloak',
        'id_company',
        'id_rol',
        'status',
    ];

    /**
     * Los atributos que deben ocultarse para la serialización.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_code_activacion' => 'datetime',
    ];

    // =========================================================================
    // RELACIONES CON TABLAS RAT
    // =========================================================================

    /**
     * Relación 1:1 con el perfil del perito.
     * Un usuario puede tener un perfil de perito en el módulo RAT.
     */
    public function peritoPerfil()
    {
        return $this->hasOne(PeritoPerfilModel::class, 'id_user', 'id_user');
    }

    /**
     * Relación 1:N con los incidentes donde el usuario es el perito asignado.
     */
    public function incidentes()
    {
        return $this->hasMany(Incidente::class, 'id_usuario_perito', 'id_user');
    }

    /**
     * Relación 1:N con los reportes generados por el perito.
     */
    public function reportes()
    {
        return $this->hasMany(Reporte::class, 'id_usuario_perito', 'id_user');
    }

    /**
     * Relación 1:N con las conclusiones validadas por el perito.
     */
    public function conclusionesValidadas()
    {
        return $this->hasMany(Conclusion::class, 'validado_por_id', 'id_user');
    }

    /**
     * Relación 1:N con los tokens JWT (blacklist para logout).
     */
    public function jwtTokens()
    {
        return $this->hasMany(JwtToken::class, 'user_id', 'id_user');
    }

    /**
     * Relación 1:N con los logs de auditoría.
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'user_id', 'id_user');
    }

    /**
     * Relación 1:N con las solicitudes a la IA.
     */
    public function iaSolicitudes()
    {
        return $this->hasMany(IaSolicitud::class, 'user_id', 'id_user');
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    /**
     * Scope para filtrar solo usuarios que son peritos.
     */
    public function scopePeritos($query)
    {
        return $query->whereHas('peritoPerfil');
    }

    /**
     * Scope para filtrar usuarios activos.
     */
    public function scopeActivos($query)
    {
        return $query->where('status', 'alta');
    }

    /**
     * Scope para filtrar por compañía.
     */
    public function scopePorCompania($query, $idCompany)
    {
        return $query->where('id_company', $idCompany);
    }

    // =========================================================================
    // MÉTODOS AUXILIARES
    // =========================================================================

    /**
     * Verifica si el usuario es un perito.
     */
    public function esPerito(): bool
    {
        return $this->peritoPerfil()->exists();
    }

    /**
     * Obtiene el nombre completo del perito (usuario + especialidad).
     */
    public function getNombrePeritoAttribute(): string
    {
        if ($this->esPerito() && $this->peritoPerfil->especialidad) {
            return "{$this->name} ({$this->peritoPerfil->especialidad})";
        }
        return $this->name;
    }

    /**
     * Obtiene las estadísticas del perito.
     */
    public function getEstadisticasPeritoAttribute(): array
    {
        return [
            'total_incidentes' => $this->incidentes()->count(),
            'incidentes_abiertos' => $this->incidentes()->where('estado', 0)->count(),
            'incidentes_en_revision' => $this->incidentes()->where('estado', 1)->count(),
            'incidentes_finalizados' => $this->incidentes()->where('estado', 2)->count(),
            'reportes_emitidos' => $this->reportes()->where('estado', 2)->count(),
            'calificacion' => $this->peritoPerfil->calificacion ?? null,
        ];
    }

    /**
     * Verifica si el código de activación es válido.
     */
    public function codigoActivacionValido(): bool
    {
        if (!$this->code_activacion || !$this->date_code_activacion) {
            return false;
        }

        $expiryDays = env('ACTIVATION_CODE_EXPIRY_DAYS', 1);
        $activationDate = \Carbon\Carbon::parse($this->date_code_activacion);
        
        return !$activationDate->copy()->addDays($expiryDays)->isPast();
    }

    /**
     * Invalida el código de activación.
     */
    public function invalidarCodigoActivacion(): void
    {
        $this->update([
            'code_activacion' => '',
            'date_code_activacion' => null,
        ]);
    }
}
