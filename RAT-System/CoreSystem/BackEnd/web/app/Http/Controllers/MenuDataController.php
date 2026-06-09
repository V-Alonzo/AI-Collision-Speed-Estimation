<?php

namespace App\Http\Controllers;

use App\Models\MenuData;
use App\Models\UserData;
use App\Models\SisCatCompanys;
use App\Models\PermisosData;
use App\Models\ModulosData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\MetaFritterVerso\FritterDynamic;
use Carbon\Carbon;

class MenuDataController extends Controller
{

    public function index()
    {
        $data = MenuData::whereNull("submenu_id")->get();

        foreach ($data as $key => $dataRow) {
            $data[$key]['children'] = DB::table('view_sys_menu')->where("submenu_id", $dataRow['menu_id'])->get(["menu_id", "key", "ruta_route", "label", "icon", "order", "submenu"]);
        }

        $response = [
            "status" => 200,
            "data" => $data,
            "message" => "Menu Actualizado",
            "type" => "success"
        ];
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function show($id, Request $request)
    {
        try {
            $parametros = $request->all();

            // Validate parameters
            if (empty($parametros) || !isset($parametros['_us'])) {
                return response()->json(['error' => 'Parámetros requeridos'], 400);
            }

            if (empty($id)) {
                return response()->json(['error' => 'ID requerido'], 400);
            }

            $caracterABuscar = " ";
            $caracterDeReemplazo = "+";
            $dataF = str_replace($caracterABuscar, $caracterDeReemplazo, $parametros['_us']);

            $us = FritterDynamic::opensslDesEncrypt($dataF);
            if (!$us) {
                return response()->json(['error' => 'Error desencriptando parámetros'], 400);
            }

            $us = json_decode($us, true);
            if (!is_array($us) || empty($us['id_keycloak'])) {
                return response()->json(['error' => 'Parámetros JSON inválidos'], 400);
            }

            if (empty($us['id_modulo'])) {
                return response()->json(['error' => 'Módulo requerido'], 400);
            }

            $idCompany = UserData::where('id_keycloak', $us['id_keycloak'])
                ->value('id_company');

            if (empty($idCompany)) {
                return response()->json(['error' => 'Empresa de usuario no encontrada'], 404);
            }

            $data = MenuData::whereNull("submenu_id")
                ->where("keycloak_id", $id)
                ->where("id_modulo", $us['id_modulo'])
                ->join('sys_cat_companys', function($join) use ($idCompany) {
                    // Compare against a constant using where to avoid backtick-quoting
                    $join->where('sys_cat_companys.id_company', '=', $idCompany);
                })
                ->select('view_sys_menu.*', 'sys_cat_companys.primary_color')
                ->orderBy('view_sys_menu.order')
                ->get();

            foreach ($data as $key => $dataRow) {
                $data[$key]['children'] = MenuData::where("submenu_id", "=", $dataRow['menu_id'])
                    ->where("keycloak_id", "=", $id)
                    ->join('sys_cat_companys', function($join)  use ($idCompany) {
                        $join->where('sys_cat_companys.id_company', '=', $idCompany);
                    })
                    ->select('view_sys_menu.menu_id', 'view_sys_menu.key', 'view_sys_menu.ruta_route', 'view_sys_menu.label', 'view_sys_menu.icon', 'view_sys_menu.order', 'sys_cat_companys.primary_color')
                    ->orderBy('view_sys_menu.order')
                    ->get();
            }

            $company = SisCatCompanys::where("id_company", $idCompany)->select('icono', 'logo')->first();

            // Obtener y validar código de activación con expiración de 1 día
            $user = UserData::where('id_keycloak', $us['id_keycloak'])
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
            "data" => $CodeActivacion === '' ? [] :  $data,
            "icono" => $company->icono,
            "logo" => $company->logo,
             "us" => $us,
            "message" => "Menu Actualizado",
            "type" => "success",
            "id_company" => $idCompany,
            'CodeActivacion'=>$CodeActivacion,
            "user" => $user,
        ];
        $response  = response()->json($response);
        //$response = FritterDynamic::opensslEncrypt($response);
        return $response;
        } catch (\Exception $e) {
            \Log::error('Error en MenuDataController show: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener menú'], 500);
        }
    }

    public function menuPermisos($id)
    {
        try {
            if (empty($id)) {
                return response()->json(['error' => 'ID requerido'], 400);
            }

            $menus = DB::table("view_sys_cat_menu")->get();
            $permisos = PermisosData::where("user_id", '=', $id)->get();

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
            }
            $response = [
                "status" => 200,
                "menu" => $menus,
                "permisos" => $permisos,
                "message" => "Menu Actualizado",
                "type" => "success"
            ];

            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
        } catch (\Exception $e) {
            \Log::error('Error en menuPermisos: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener permisos'], 500);
        }
    }

    public function modulos($id)
    {
        try {
            if (empty($id)) {
                return response()->json(['error' => 'ID requerido'], 400);
            }

            $modulos = ModulosData::where("id_keycloak", '=', $id)->get();
            $response = [
                "status" => 200,
                "modulos" => $modulos,
                "message" => "Actualizado",
                "type" => "success"
            ];
            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
        } catch (\Exception $e) {
            \Log::error('Error en modulos: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener módulos'], 500);
        }
    }

    public function addPermiso(Request $request)
    {
        try {
            $params = $request->all();
            
            if (empty($params) || !isset($params[0])) {
                return response()->json(['error' => 'Parámetros requeridos'], 400);
            }
            
            $params = $params[0];
            if (!is_string($params)) {
                return response()->json(['error' => 'Formato de parámetros inválido'], 400);
            }
            
            $decrypted = FritterDynamic::opensslDesEncrypt($params);
            if (!$decrypted) {
                return response()->json(['error' => 'Error desencriptando parámetros'], 400);
            }
            
            $decoded = json_decode($decrypted, true);
            if (!is_array($decoded)) {
                return response()->json(['error' => 'Parámetros JSON inválidos'], 400);
            }
            
            $params = $decoded;
            PermisosData::create($params);

            $response = [
                "status" => 200,
                "message" => "Permiso Actualizado",
                "type" => "success"
            ];
            return response()->json($response, 200);
        } catch (\Exception $e) {
            \Log::error('Error en addPermiso: ' . $e->getMessage());
            return response()->json(['error' => 'Error al crear permiso'], 500);
        }
    }

    public function deletePermiso($id)
    {
        try {
            if (empty($id) || !is_numeric($id)) {
                return response()->json(['error' => 'ID inválido'], 400);
            }

            PermisosData::findOrFail($id)->delete();
            $response = [
                "status" => 200,
                "message" => "Permiso Eliminado",
                "type" => "success"
            ];
            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Permiso no encontrado'], 404);
        } catch (\Exception $e) {
            \Log::error('Error en deletePermiso: ' . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar permiso'], 500);
        }
    }
}
