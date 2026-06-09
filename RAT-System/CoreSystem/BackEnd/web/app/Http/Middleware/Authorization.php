<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Authorization
{
    public function handle($request, Closure $next)
    {
        try {
            // 1. Obtener el token
            $authHeader = $request->header('Authorization');
            $token = null;

            if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }

            if (!$token) {
                return response()->json(['message' => 'Token no proporcionado'], 401);
            }

            // 2. Validar el secreto
            $secret = env('JWT_SECRET');
            if (!$secret) {
                return response()->json(['message' => 'JWT_SECRET no configurado en .env'], 500);
            }

            // 3. Decodificar
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            // 4. Guardar el usuario 
            $request->attributes->add(['user' => $decoded]);
            return $next($request);

        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error de autenticación',
                'detalle' => $e->getMessage()
            ], 401);
        }
    }
}