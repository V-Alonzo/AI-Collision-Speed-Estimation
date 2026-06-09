<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class JwtToken extends Model
{
    protected $table      = 'jwt_tokens';
    public    $timestamps = false;

    protected $fillable = [
        'user_id', 'token_hash', 'expires_at', 'created_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * Revoca un token dado su valor raw (no el hash).
     * Llamar desde LoginController@logout.
     */
    public static function revocar(string $tokenRaw, int $userId, \DateTime $expiresAt): self
    {
        return static::create([
            'user_id'    => $userId,
            'token_hash' => hash('sha256', $tokenRaw),
            'expires_at' => $expiresAt,
            'created_at' => now(),
        ]);
    }

    /**
     * Verifica si un token está en la blacklist.
     */
    public static function estaRevocado(string $tokenRaw): bool
    {
        return static::where('token_hash', hash('sha256', $tokenRaw))
            ->where('expires_at', '>', now())
            ->exists();
    }
}
