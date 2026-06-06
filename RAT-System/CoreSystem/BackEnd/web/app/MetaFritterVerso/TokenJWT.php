<?php

namespace App\MetaFritterVerso;

use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;


class TokenJWT
{

    public static function verify()
    {
        if (is_null(self::getBearerToken())) {
            return ["msg" => "Acceso no autorizado", "status" => 401];
        }
        $token = self::getBearerToken();
        try {
            $decoded = JWT::decode($token, new Key(self::getPublicKey(), 'RS256'));
            return ["msg" => "Verificación exitosa", "jwt" => $decoded, "status" => 200];
        } catch (Exception $e) {
            return ["msg" => $e->getMessage(),"status"=>401];
        }
    }

    private static function getPublicKey()
    {
        $publicKey = env('KEYCLOAK_KEY_PUBLIC');
        $publicKey = <<<EOD
		-----BEGIN PUBLIC KEY-----
		$publicKey
		-----END PUBLIC KEY-----
		EOD;

        return $publicKey;
    }

private static function getAuthorizationHeader()
{
    $header = null;

    // 1) Lo más común: Apache pasa el header como HTTP_AUTHORIZATION
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['HTTP_AUTHORIZATION']);
    // 2) Algunos Apache/CGI lo pasan como REDIRECT_HTTP_AUTHORIZATION
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    // 3) Fallback: apache_request_headers() (case-insensitive)
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();

        // Normalizar nombres de headers a minúsculas
        $requestHeaders = array_change_key_case($requestHeaders, CASE_LOWER);

        if (isset($requestHeaders['authorization'])) {
            $header = trim($requestHeaders['authorization']);
        }
    }

    // Devuelve el header encontrado o null si no hubo ninguno
    return $header;
}

    private static function getBearerToken()
    {
        $headers = self::getAuthorizationHeader();
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    private function tokenSegments($token)
    {
        $jwt = explode(".", $token);
        return ["header" => $jwt[0], "payload" => $jwt[1], "signature" => $jwt[2]];
    }

    private function parseJWT($jwt)
    {
        return base64_decode($jwt);
    }
}
