<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use App\Models\Rat\PeritoPerfilModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PerfilController extends Controller
{
    private function jwtUserId(Request $request): int
    {
        $user = $request->attributes->get('user');
        return (int) ($user->id_user ?? 0);
    }

    /**
     * GET /v1/rat/perfil
     */
    public function show(Request $request): JsonResponse
    {
        $userId = $this->jwtUserId($request);

        $perfil = DB::table('RAT_PERITO_PERFIL AS p')
            ->join('sys_users AS u', 'u.id_user', '=', 'p.id_user')
            ->where('p.id_user', $userId)
            ->select(
                'u.id_user', 'u.name', 'u.email',
                'p.telefono', 'p.cedula_profesional', 'p.especialidad',
                'p.numero_empleado', 'p.calificacion', 'p.fecha_alta'
            )
            ->first();

        if (!$perfil) {
            $perfil = DB::table('sys_users')->where('id_user', $userId)
                ->select('id_user', 'name', 'email')
                ->first();
        }

        $stats = DB::table('RAT_INCIDENTE')
            ->where('id_usuario_perito', $userId)
            ->selectRaw("
                COUNT(*) AS total_expedientes,
                SUM(CASE WHEN estado = 2 THEN 1 ELSE 0 END) AS finalizados
            ")
            ->first();

        return response()->json([
            'perfil' => $perfil,
            'stats'  => [
                'expedientes'  => (int) ($stats->total_expedientes ?? 0),
                'finalizados'  => (int) ($stats->finalizados       ?? 0),
                'calificacion' => $perfil->calificacion            ?? null,
            ],
        ]);
    }

    /**
     * PUT /v1/rat/perfil
     */
    public function update(Request $request): JsonResponse
    {
        $userId = $this->jwtUserId($request);

        $data = $request->validate([
            'telefono'           => 'nullable|string|max:20',
            'cedula_profesional' => 'nullable|string|max:30',
            'especialidad'       => 'nullable|string|max:200',
            'numero_empleado'    => 'nullable|string|max:30',
        ]);

        PeritoPerfilModel::updateOrCreate(
            ['id_user' => $userId],
            $data
        );

        return response()->json(['message' => 'Perfil actualizado.']);
    }

    /**
     * GET /v1/rat/perfil/expedientes
     */
    public function misExpedientes(Request $request): JsonResponse
    {
        $userId = $this->jwtUserId($request);

        $expedientes = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS th', 'i.tipo_hecho_id', '=', 'th.id')
            ->where('i.id_usuario_perito', $userId)
            ->select(
                'i.uuid',
                'i.numero_siniestro',
                'i.fecha_hecho',
                'i.estado',
                'th.nombre AS tipo_hecho'
            )
            ->orderByDesc('i.fecha_hecho')
            ->limit(10)
            ->get();

        return response()->json($expedientes);
    }

    /**
     * PUT /v1/rat/perfil/cambiar-password
     */
    public function cambiarPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password_actual'              => 'required|string',
            'password_nuevo'               => 'required|string|min:8',
            'password_nuevo_confirmation'  => 'required|same:password_nuevo',
        ]);

        $userId = $this->jwtUserId($request);
        $user   = DB::table('sys_users')->where('id_user', $userId)->first();

        if (!$user || $request->password_actual !== $user->password) {
            return response()->json(['message' => 'La contraseña actual es incorrecta.'], 422);
        }

        DB::table('sys_users')
            ->where('id_user', $userId)
            ->update(['password' => $request->password_nuevo]);

        return response()->json(['message' => 'Contraseña actualizada.']);
    }
}
