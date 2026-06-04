<?php

namespace App\Http\Controllers\RAT;

use App\Models\ViewUserData;
use App\Models\UserData;
use App\Models\PermisosData;
use Illuminate\Http\Request;
use App\MetaFritterVerso\FritterDynamic;
use Illuminate\Support\Facades\DB;
use App\MetaFritterVerso\TokenJWT;
use Carbon\Carbon;


class UserDataController extends Controller
{

    public function index()
    {
        $catalogo = DB::table('view_sys_cat_menu')
            ->selectRaw('DISTINCT id_modulo as value , modulo as label')
            ->orderBy('modulo')
            ->get();

        $data = ViewUserData::where("view_users_data.status", "alta")->get();
        $form = FritterDynamic::itemsForm('Usuarios');
        $columns = FritterDynamic::columnsTable('Usuarios');
        $props_table = FritterDynamic::propsTable('Usuarios');

        $response = [
            "status" => 200,
            "message" => "Informacion Actualizada de usuarios ",
            "type" => "success",
            "data" => $data,
            "catalogo" => $catalogo,
            "formItems" => $form,
            "columns" => $columns,
            "props_table" => $props_table,
            
        ];
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
        
    }

    public function show($id)
    {
        $response  = response()->json(ViewUserData::where("id_keycloak", $id)->get());
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function update($id, Request $request)
    {
        try {
            $data = UserData::findOrFail($id);
            $params = $request->all();
            
            if (!isset($params[0]) || empty($params[0])) {
                return response()->json(['error' => 'Invalid parameters'], 400);
            }
            
            $decrypted = FritterDynamic::opensslDesEncrypt($params[0]);
            if (!$decrypted) {
                return response()->json(['error' => 'Decryption failed'], 400);
            }
            
            $decoded = json_decode($decrypted, true);
            if (!is_array($decoded)) {
                return response()->json(['error' => 'Invalid JSON format'], 400);
            }
            
            $data->update($decoded);

            $response = [
                "status" => 200,
                "message" => "Se modificó correctamente el registro!",
                "type" => "success",
                "tipoComponent" => "notification"
            ];

            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('User not found');
            return response()->json(['error' => 'User not found'], 404);
        } catch (\Exception $e) {
            \Log::error('Update error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    public function menuPermisos($id, Request $request)
    {
        // Obtener el raw body - el string encriptado que envías desde JS
        $rawBody = $request->getContent();
       // \Log::info('Raw body recibido:', ['body' => $rawBody, 'tipo' => gettype($rawBody)]);
        
        // Si no hay contenido, obtener desde $request->all()
        if (empty($rawBody)) {
            $params = $request->all();
        } else {
            // El body es un string, intentar decodificarlo
            $params = json_decode($rawBody, true);
            
            // Si no es JSON, es un string encriptado directo
            if ($params === null) {
                $params = $rawBody;
            }
        }
        
        // Si es un array, tomar el primer elemento
        if (is_array($params) && isset($params[0])) {
            $params = $params[0];
        } elseif (empty($params)) {
            return response()->json(['error' => 'Parámetros inválidos'], 400);
        }
        
        // Si es un objeto, convertir a array
        if (is_object($params)) {
            $params = (array) $params;
        }
        
        // Si es string encriptado, desencriptar
        if (is_string($params)) {
            $params = FritterDynamic::opensslDesEncrypt($params);
            $params = (array) json_decode($params);
        }
        
        \Log::info('Parámetros procesados:', $params);

        //$params['id_modulo']


        $menus = DB::table("view_sys_cat_menu")
            ->where("id_modulo", $params['id_modulo'])
            ->orderBy('ruta_route')
            ->get();
        $permisos = PermisosData::where("keycloak_id", $id)->get();

        // $id_keycloak = UserData::where('id_user', $id)->value('id_keycloak');

        foreach ($menus as $menu) {
            $aux = false;
            $permission_id = 0;
            $menu_id = $menu->menu_id;
            foreach ($permisos as $permiso) {
                $permission_id = $permiso->permission_id;
                if ($permiso->menu_id == $menu_id) {
                    $aux = true;
                    break;
                }
            }
            $menu->checked = $aux;
            $menu->permission_id = $permission_id;
            // $menu->keycloak_id = $id_keycloak;
        }
        $response = [
            "status" => 200,
            "menu" => $menus,
            "permisos" => $permisos,
            "message" => "Menu Actualizado",
            "type" => "success"
        ];

        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }


    public function addPermiso(Request $request)
    {
        $params = $request->all();
        $params = $params[0];
        $params = FritterDynamic::opensslDesEncrypt($params);
        $params = (array) json_decode($params);
        PermisosData::create($params);

        DB::table('sys_modulos_user')
            ->updateOrInsert(
                ['id_modulo' => $params['id_modulo'], 'id_keycloak' => $params['keycloak_id']],
                ['id_keycloak' => $params['keycloak_id']]
            );

        $response = [
            "status" => 200,
            "message" => "Permiso Actualizado",
            "type" => "success",
            'params' => $params
        ];
        return response()->json($response, 200);
    }

    public function deletePermiso($id)
    {
        PermisosData::findOrFail($id)->delete();
        $response = [
            "status" => 200,
            "message" => "Permiso Eliminado",
            "type" => "success"
        ];
        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }


    public function showVerificacionUsuario($id_keycloack, Request $request)
    {

     $tokenData = TokenJWT::verify();
     $id_keycloak = null;
     $username = null;            
       if ($tokenData['status'] === 200 && isset($tokenData['jwt'])) {
                $jwt = $tokenData['jwt'];
                $id_keycloak = $jwt->sub ?? null;
                $username = $jwt->preferred_username ?? $jwt->name ?? $jwt->email ?? null;
        }

        
         // Obtener y validar código de activación con expiración de 1 día
        $user = UserData::where('id_keycloak', $id_keycloak)
            ->first(['id_user', 'code_activacion', 'date_code_activacion']);

        $CodeActivacion = '';
        if ($user && $user->code_activacion && $user->date_code_activacion) {
            $activationDate = Carbon::parse($user->date_code_activacion);
            $expiryDays = env('ACTIVATION_CODE_EXPIRY_DAYS', 1);
            // Si han pasado más de X días desde la fecha del código, se invalida
            if ($activationDate->copy()->addDays($expiryDays)->isPast()) {
                // Actualizar en BD para reflejar la expiración
                $user->code_activacion = '';
                $user->save();
            } else {
                $CodeActivacion = $user->code_activacion;
            }
        }

        $response = [
            "status" => 200,
            "message" => "Información de verificación de usuario ",
            "type" => "success",
            "CodeActivacion" => $CodeActivacion,
            "id_keycloak" => $id_keycloak,

        ];
        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    
    public function showHandleEnviarCodigo($id_keycloack, Request $request)
    {

     $tokenData = TokenJWT::verify();
     $id_keycloak = null;
     $username = null;            
       if ($tokenData['status'] === 200 && isset($tokenData['jwt'])) {
                $jwt = $tokenData['jwt'];
                $id_keycloak = $jwt->sub ?? null;
                $username = $jwt->preferred_username ?? $jwt->name ?? $jwt->email ?? null;
        }

        
         // Obtener y validar código de activación con expiración de 1 día
        $email = UserData::where('id_keycloak', $id_keycloak)
            ->value('email');

       $CodeActivacion = FritterDynamic::getCodigoActivacion();

    $Subjet = "Código de verificación";
    $Body = "Hola,<br><br>Tu código de verificación es: <b>" . $CodeActivacion . "</b><br>Este código es válido por 24 horas.<br><br>Si no solicitaste este código, por favor ignora este correo.<br><br>Saludos cordiales,<br>Equipo de Soporte.";
    $fromName = "Acceso a la plataforma VINCrashTrace";

       $respMail = FritterDynamic::apiEnviaCorreo($email, $Subjet, $Body,  $fromName) ;

        // Validar respuesta del correo
        $mailSent = false;
        if ($respMail) {
            $respMailArray = json_decode($respMail, true);
            // Validar que el correo se envió correctamente
            if (isset($respMailArray['send']) && $respMailArray['send'] === true && isset($respMailArray['msg']) && $respMailArray['msg'] === "Done!") {
                $mailSent = true;
                // Actualizar el código de activación y la fecha en la base de datos
                $expiryDays = env('ACTIVATION_CODE_EXPIRY_DAYS', 1);
                UserData::where('id_keycloak', $id_keycloak)->update([
                    'code_activacion' => $CodeActivacion,
                    'date_code_activacion' => Carbon::now()->subDays($expiryDays)
                ]);
            }
        }

        $response = [
            "status" => 200,
            "message" => $mailSent ? "Código enviado correctamente" : "Error al enviar el código",
            "type" => $mailSent ? "success" : "error",
            "email" => $email,
            "CodeActivacion" => $mailSent ? $CodeActivacion : '',
            "respMail" => $respMail,
            "mailSent" => $mailSent

        ];
        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }
    
     public function showHandleValidarCodigo($id_keycloack, $codigo_activacion, Request $request)
    {

     $tokenData = TokenJWT::verify();
     $id_keycloak = null;         
       if ($tokenData['status'] === 200 && isset($tokenData['jwt'])) {
                $jwt = $tokenData['jwt'];
                $id_keycloak = $jwt->sub ?? null;
        }

        
         // Obtener y validar código de activación con expiración de 1 día
        $user = UserData::where('id_keycloak', $id_keycloak)
            ->first(['id_user', 'code_activacion', 'date_code_activacion']);

        $CodeActivacion = $user && $user->code_activacion ? $user->code_activacion : '';

        $Validacion = false;
 
        if($CodeActivacion == $codigo_activacion){
            // Código válido, proceder con la lógica necesaria
            // Por ejemplo, activar al usuario o permitir acceso
            $Validacion = true;

            UserData::where('id_keycloak', $id_keycloak)->update([                  
                    'date_code_activacion' => Carbon::now()
                ]);

        }

        $response = [
            "status" => 200,
            "message" => "Validacion de código correctamente" ,
            "type" => "success" ,
            "CodeActivacion" =>  $CodeActivacion ,
            "Validacion" =>  $Validacion

        ];
        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }
}
