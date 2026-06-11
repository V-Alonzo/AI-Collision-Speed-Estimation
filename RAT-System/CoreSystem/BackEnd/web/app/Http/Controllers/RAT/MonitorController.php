<?php

namespace App\Http\Controllers\RAT;

use App\Models\Insurer;
use App\Models\Vehicle;
use App\Models\PhotoEvent;
use App\Models\Photo;
use App\Models\LogMonitor;
use App\Models\UserData;
use App\Models\ViewUserData;
use App\Models\ViewLogMonitor;
use App\Models\CatConstantes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\MetaFritterVerso\FritterDynamic;
use App\MetaFritterVerso\TokenJWT;
use Carbon\Carbon;


class MonitorController extends Controller
{
  public function show(Request $request)
{
      try {
        $tokenData = TokenJWT::verify();
        if ($tokenData['status'] !== 200) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }
        
        $id_keycloak = null;
        $username = null;            
        if (isset($tokenData['jwt'])) {
            $jwt = $tokenData['jwt'];
            $id_keycloak = $jwt->sub ?? null;
            $username = $jwt->preferred_username ?? $jwt->name ?? $jwt->email ?? null;
        }
        
        if (empty($id_keycloak)) {
            return response()->json(['error' => 'Usuario no identificado'], 400);
        }
        
        $idCompany = UserData::where('id_keycloak', $id_keycloak)->value('id_company');
        if (empty($idCompany)) {
            return response()->json(['error' => 'Empresa no encontrada'], 404);
        }

        $logs = LogMonitor::where('id_keycloak', $id_keycloak)
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->get();
        $totalLogs = $logs->count();

        $constante = CatConstantes::where('id_constante', 1)->value('valor_boleano');



        $response = [
            "status" => 200,
            "message" => "Informacion Actualizada de usuarios ",
            "type" => "success",
            "username" => $username,
            "id_keycloak" => $id_keycloak,
            "total_registros" => $totalLogs,
            "constante" => $constante,
        ];
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
        } catch (\Exception $e) {
            \Log::error('Error en show: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener datos'], 500);
        }


    }

    public function showDataFormFiltros(Request $request)
    {
        try {
            $tokenData = TokenJWT::verify();
            if ($tokenData['status'] !== 200) {
                return response()->json(['error' => 'Token inválido o expirado'], 401);
            }
            
            $id_keycloak = null;
            $username = null;            
            if (isset($tokenData['jwt'])) {
                $jwt = $tokenData['jwt'];
                $id_keycloak = $jwt->sub ?? null;
                $username = $jwt->preferred_username ?? $jwt->name ?? $jwt->email ?? null;
            }
            
            if (empty($id_keycloak)) {
                return response()->json(['error' => 'Usuario no identificado'], 400);
            }

            $idCompany = UserData::where('id_keycloak', $id_keycloak)->value('id_company');
            if (empty($idCompany)) {
                return response()->json(['error' => 'Empresa no encontrada'], 404);
            }

            $CatEmpresas = [];
            $CatUsers = [];

            if($idCompany == 1){
                $CatEmpresas = ViewUserData::where('status', '=', 'alta')
                    ->distinct()
                    ->select('id_company', 'company')
                    ->get()
                    ->toArray();

                $CatUsers = ViewUserData::where('status', '=', 'alta')
                    ->distinct()
                    ->select('id_company', 'preferred_username', 'id_keycloak', 'name')
                    ->get()
                    ->toArray();

            }else{
                $CatEmpresas = ViewUserData::where('status', '=', 'alta')->where('id_company', '=', $idCompany)
                    ->distinct()
                    ->select('id_company', 'company')
                    ->get()
                    ->toArray();

                $CatUsers = ViewUserData::where('status', '=', 'alta')->where('id_company', '=', $idCompany)
                    ->distinct()
                    ->select('id_company', 'preferred_username', 'id_keycloak', 'name')
                    ->get()
                    ->toArray();
            }

        $data = [];
        $columns = FritterDynamic::columnsTable('Visor de Consultas');
        $props_table = FritterDynamic::propsTable('Visor de Consultas');

       

         $response = [
            "status" => 200,
            "message" => "Informacion Actualizada de usuarios ",
            "type" => "success",
            "username" => $username,
            "id_keycloak" => $id_keycloak,
            "idCompany" => $idCompany,
            "CatEmpresas" => $CatEmpresas,
            "CatUsers" => $CatUsers,
            'data' => $data,
            "columns" => $columns,
            "props_table" => $props_table,
        ];
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
        } catch (\Exception $e) {
            \Log::error('Error en showDataFormFiltros: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener datos'], 500);
        }


    }

    public function showConsultaDataVisor(Request $request)
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

            $idCompany = $params['id_company'] ?? null;
            $idKeycloak = $params['id_keycloack'] ?? ($params['id_keycloak'] ?? null);
            $fechaInicio = $params['fecha_inicio'] ?? null;
            $fechaFin = $params['fecha_fin'] ?? null;



        $tokenData = TokenJWT::verify();
        $id_keycloak = null;
          
        if ($tokenData['status'] === 200 && isset($tokenData['jwt'])) {
                $jwt = $tokenData['jwt'];
                $id_keycloak = $jwt->sub ?? null;              
        }

        $idCompanyUser = UserData::where('id_keycloak', $id_keycloak)
            ->value('id_company');
        if($idCompanyUser != 1){
            $idCompany = $idCompanyUser;
        }

         $idRolUser = UserData::where('id_keycloak', $id_keycloak)
            ->value('id_rol');
        if($idRolUser != 1){
            $idKeycloak = $id_keycloak;
        }
  



        $logsQuery = ViewLogMonitor::query();

        if ($idCompany) {
            $logsQuery->where('id_company', $idCompany);
        }

        if ($idKeycloak) {
            $logsQuery->where('id_keycloak', $idKeycloak);
        }

        if ($fechaInicio && $fechaFin) {
            $logsQuery->whereBetween('created_at', [
                Carbon::parse($fechaInicio)->startOfDay(),
                Carbon::parse($fechaFin)->endOfDay(),
            ]);
        } elseif ($fechaInicio) {
            $logsQuery->where('created_at', '>=', Carbon::parse($fechaInicio)->startOfDay());
        } elseif ($fechaFin) {
            $logsQuery->where('created_at', '<=', Carbon::parse($fechaFin)->endOfDay());
        }

        $data = $logsQuery->select('id_keycloak', 'company', 'name', 'consulta', DB::raw('COUNT(*) as no_consultas'), DB::raw("DATE_FORMAT(MAX(created_at), '%d-%m-%Y') as fec_ult_consulta"))
                ->groupBy('id_keycloak', 'company', 'name', 'consulta')
                ->get();


         $response = [
            "status" => 200,
            "message" => "Informacion Actualizada de showConsultaDataVisor ",
            "type" => "success",
            "params" => $params,
            "data" => $data,
            "idCompanyUser" => $idCompanyUser,
            "id_keycloak" => $id_keycloak,
            "idCompany" => $idCompany,
            "logsQuery" => $logsQuery->toSql(),
            "idKeycloak" => $idKeycloak,
           
        ];
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
        } catch (\Exception $e) {
            \Log::error('Error en showConsultaDataVisor: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener datos'], 500);
        }


    }

      public function showapiOnVerDetalle(Request $request)
      {   
          try {
              $params = $request->all();
              
              if (empty($params) || !isset($params[0])) {
                  return response()->json(['error' => 'Parámetros requeridos'], 400);
              }
              
              // Si los parámetros están en un array indexado, tomar el primer elemento
              if (is_array($params) && isset($params[0]) && is_string($params[0])) {
                  $params = $params[0];
              } else {
                  // Si es un array asociativo, buscar la clave con los datos encriptados
                  $params = $params[0] ?? reset($params) ?? $params;
              }
              
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
         
              $idKeycloak = $params['id_keycloack'] ?? ($params['id_keycloak'] ?? null);
              $consulta = $params['consulta'] ?? ($params['consulta'] ?? null);
              $fechaInicio = $params['fecha_inicio'] ?? null;
              $fechaFin = $params['fecha_fin'] ?? null;

              $logsQuery = ViewLogMonitor::query();

             
              if ($idKeycloak) {
                  $logsQuery->where('id_keycloak', '=', $idKeycloak);
              }

              if ($consulta) {
                  $logsQuery->where('consulta', '=', $consulta);
              }


              if ($fechaInicio && $fechaFin) {
                  $logsQuery->whereBetween('created_at', [
                      Carbon::parse($fechaInicio)->startOfDay(),
                      Carbon::parse($fechaFin)->endOfDay(),
                  ]);
              } elseif ($fechaInicio) {
                  $logsQuery->where('created_at', '>=', Carbon::parse($fechaInicio)->startOfDay());
              } elseif ($fechaFin) {
                  $logsQuery->where('created_at', '<=', Carbon::parse($fechaFin)->endOfDay());
              }


              $columns = FritterDynamic::columnsTable('Visor de Consultas Detalle');
              $props_table = FritterDynamic::propsTable('Visor de Consultas Detalle');

              $data = $logsQuery->select('consulta', DB::raw("DATE_FORMAT(created_at, '%d-%m-%Y') as fecha"))
                      ->get()
                      ->map(function($item) {
                          return [
                              'consulta' => $item->consulta,
                              'created_at' => $item->fecha
                          ];
                      });

          

             $response = [
                "status" => 200,
                "message" => "Informacion Actualizada de showapiOnVerDetalle ",
                "type" => "success",
                "params" => $params,
                "data"=> $data,
                "columns" => $columns,
                "props_table" => $props_table,
               
            ];
            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
          } catch (\Exception $e) {
              \Log::error('Error en showapiOnVerDetalle: ' . $e->getMessage());
              return response()->json(['error' => 'Error al obtener datos'], 500);
          }


    }


}
