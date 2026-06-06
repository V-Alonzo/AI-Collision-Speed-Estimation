<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    private function requireAdmin(Request $request): void
    {
        $user  = $request->attributes->get('user');
        $email = $user->email ?? '';
        if ($email !== 'admin@cesvi.com') {
            abort(403, 'Acceso restringido a administradores.');
        }
    }

    /**
     * GET /api/v1/rat/admin/usuarios
     */
    public function getUsuarios(Request $request): JsonResponse
    {
        $this->requireAdmin($request);

        $usuarios = DB::table('sys_users AS u')
            ->leftJoin('RAT_PERITO_PERFIL AS p', 'p.id_user', '=', 'u.id_user')
            ->select(
                'u.id_user',
                'u.name',
                'u.email',
                'u.created_at',
                'p.telefono',
                'p.especialidad',
                'p.numero_empleado',
                DB::raw("(SELECT COUNT(*) FROM RAT_INCIDENTE WHERE id_usuario_perito = u.id_user) AS total_expedientes")
            )
            ->orderBy('u.name')
            ->get();

        return response()->json($usuarios);
    }

    /**
     * PUT /api/v1/rat/admin/usuarios/{id}/password
     */
    public function updatePassword(Request $request, int $id): JsonResponse
    {
        $this->requireAdmin($request);

        $this->validate($request, [
            'password_nuevo' => 'required|string|min:8',
        ]);

        $user = DB::table('sys_users')->where('id_user', $id)->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        // No permitir cambiar la contraseña del propio admin desde este endpoint
        if ($user->email === 'admin@cesvi.com') {
            return response()->json(['message' => 'Use el perfil para cambiar su propia contraseña.'], 422);
        }

        DB::table('sys_users')
            ->where('id_user', $id)
            ->update(['password' => $request->password_nuevo]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }
}
