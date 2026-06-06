<?php

namespace App\Http\Controllers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $email    = trim($request->input('email', ''));
        $password = $request->input('password', '');

        if (!$email || !$password) {
            return response()->json(['message' => 'Email y contraseña requeridos.'], 422);
        }

        $user = DB::table('sys_users')->where('email', $email)->first();

        if (!$user) {
            return response()->json(['message' => 'No se encontró usuario con el correo proporcionado.'], 401);
        }

        if ($password !== $user->password) {
            return response()->json(['message' => 'Contraseña incorrecta.'], 401);
        }

        $secret = env('JWT_SECRET', '2d9578b39689e6736f52e42af9a6f4913db5849323dc999d6316c4a9dc305627%');

        $payload = [
            'iat'     => time(),
            'exp'     => time() + (24 * 60 * 60),
            'id_user' => $user->id_user,
            'email'   => $user->email,
            'name'    => $user->name,
        ];

        $token = JWT::encode($payload, $secret, 'HS256');

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id_user' => $user->id_user,
                'email'   => $user->email,
                'name'    => $user->name,
            ],
        ], 200);
    }

    public function me(Request $request)
    {
        $jwtUser = $request->attributes->get('user');

        return response()->json([
            'success' => true,
            'user'    => [
                'id_user' => $jwtUser->id_user ?? null,
                'email'   => $jwtUser->email   ?? null,
                'name'    => $jwtUser->name    ?? null,
            ],
        ], 200);
    }
}
