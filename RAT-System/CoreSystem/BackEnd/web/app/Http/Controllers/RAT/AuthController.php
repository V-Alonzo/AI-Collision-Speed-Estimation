<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // =========================================================
    //  POST /api/v1/rat/auth/login
    // =========================================================
    public function login(Request $request): JsonResponse
    {
        $this->validate($request, [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = DB::table('sys_users')
            ->where('email', $request->email)
            ->first();

        if (!$user || $request->password !== $user->password) {
            return response()->json([
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }

        // Genera un token personal (requiere Laravel Sanctum o Passport)
        // Con Sanctum: $token = $userModel->createToken('rat-api')->plainTextToken;
        // Fallback: token simple en base64 (reemplazar con Sanctum en producción)
        $token = base64_encode("{$user->id_user}:" . now()->timestamp . ":" . hash('sha256', $user->password));

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'     => $user->id_user,
                'name'   => $user->name,
                'email'  => $user->email,
                'perfil' => $user->perfil ?? null,
            ],
        ]);
    }

    // =========================================================
    //  GET /api/v1/rat/auth/me
    // =========================================================
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        return response()->json([
            'user' => [
                'id'     => $user->id_user ?? $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'perfil' => $user->perfil ?? null,
            ],
        ]);
    }

    // =========================================================
    //  POST /api/v1/rat/auth/logout
    // =========================================================
    public function logout(Request $request): JsonResponse
    {
        // Con Sanctum: $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }
}
