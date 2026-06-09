<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\MetaFritterVerso\TokenJWT;

class ReportePeritoController extends Controller
{
    public function show($id, Request $request)
    {
        // Revalidamos para leer claims del token
        $tokenData = TokenJWT::verify();
        if (($tokenData['status'] ?? 401) !== 200) {
            return response()->json([
                "status" => 401,
                "message" => $tokenData['msg'] ?? "Acceso no autorizado",
                "type" => "denegate"
            ], 401);
        }

        $jwt = $tokenData['jwt'];

        // Nota: Keycloak normalmente no trae id_user; luego mapeamos a sys_users por email/username
        $tokenUserId = $jwt->id_user ?? null;

        if ($tokenUserId === null) {
            return response()->json([
                "status" => 403,
                "message" => "Token OK, pero falta id_user (pendiente mapeo con sys_users)",
                "type" => "forbidden",
                "claims" => array_keys((array)$jwt),
            ], 403);
        }

        // Solo el mismo perito (después metemos admin si aplica)
        if ((int)$tokenUserId !== (int)$id) {
            return response()->json([
                "status" => 403,
                "message" => "No autorizado",
                "type" => "forbidden"
            ], 403);
        }

        // Respuesta temporal (aquí ya armamos el reporte real)
        return response()->json([
            "ok" => true,
            "perito_id" => (int)$id,
            "sub" => $jwt->sub ?? null,
            "username" => $jwt->preferred_username ?? null,
        ], 200);
    }
}
