<?php

namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\MetaFritterVerso\FritterDynamic;
use Illuminate\Support\Facades\DB;

class CatalogsController extends Controller
{

    public function showAll()
    {
        $form = FritterDynamic::itemsForm("Catalogos");
        $columns = [];
        $props_table = [];
        $data = [];

        $response = [
            "status" => 200,
            "data" => $data,
            "formItems" => $form,
            "columns" => $columns,
            "props_table" => $props_table,
            "message" => "Información Actualizada",
            "type" => "success"
        ];

        // return response()->json($response);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function showCatalog($id)
    {
        try {
            // Input validation
            if (empty($id) || !is_numeric($id) || $id <= 0) {
                return response()->json(['error' => 'ID de catálogo inválido'], 400);
            }

            $cat_table_id = (int) $id;
            $form = [];
            $columns = [];
            $props_table = [];
            $data = [];
            $name_id = "";

            if ($cat_table_id > 0) {
                $sys_cat_tables = DB::table('sys_cat_tables')
                    ->where('cat_table_id', '=', $cat_table_id)
                    ->get();
                    
                if ($sys_cat_tables->isEmpty()) {
                    return response()->json(['error' => 'Catálogo no encontrado'], 404);
                }
                    
                foreach ($sys_cat_tables as $value) {
                    $name_table = $value->name_table;
                    $view_table = $value->name_view;
                    $form_id = $value->form_id;
                    $table_id = $value->table_id;
                    $name_id = $value->pk;
                }
                
                if (empty($form_id) || empty($table_id)) {
                    return response()->json(['error' => 'Configuración del catálogo incompleta'], 400);
                }
                
                $table_name = DB::table('sys_tables')->where('table_id', '=', $table_id)->get();
                $form_name = DB::table('sys_forms')->where('forms_id', '=', $form_id)->get();

                $aux_name_form = null;
                $aux_name_table = null;
                
                foreach ($form_name as $value) {
                    $aux_name_form = $value->name_form;
                }
                foreach ($table_name as $value) {
                    $aux_name_table = $value->name_table;
                }

                if (empty($aux_name_form) || empty($aux_name_table)) {
                    return response()->json(['error' => 'Configuración incompleta'], 400);
                }

                $form = FritterDynamic::itemsForm($aux_name_form);
                $columns = FritterDynamic::columnsTable($aux_name_table);
                $props_table = FritterDynamic::propsTable($aux_name_table);
                
                if ($view_table == "NA") {
                    if ($name_table === "sys_cat_tables") {
                        $data = DB::table($name_table)
                            ->where('type', '=', 'operation')
                            ->where('status', '=', 'alta')
                            ->get();
                    } else {
                        $data = DB::table($name_table)
                            ->where('status', '=', 'alta')
                            ->get();
                    }
                } else {
                    $data = DB::table($view_table)
                        ->where('status', '=', 'alta')
                        ->get();
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error en showCatalog: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener catálogo'], 500);
        }

        $response = [
            "status" => 200,
            "data" => $data,
            "id" => $name_id,
            "formItems" => $form,
            "columns" => $columns,
            "props_table" => $props_table,
            "message" => "Información Actualizada",
            "type" => "success"
        ];
        // return response()->json($response);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function create($id, Request $request)
    {
        try {
            // Input validation
            if (empty($id) || !is_numeric($id) || $id <= 0) {
                return response()->json(['error' => 'ID de catálogo inválido'], 400);
            }

            $params = $request->all();
            \Log::info('Request data:', $params);
            
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
                $decrypted = FritterDynamic::opensslDesEncrypt($params);
                if (!$decrypted) {
                    return response()->json(['error' => 'Error desencriptando parámetros'], 400);
                }
                $decoded = json_decode($decrypted, true);
                if (!is_array($decoded)) {
                    return response()->json(['error' => 'Parámetros JSON inválidos'], 400);
                }
                $params = $decoded;
            }
            
            $arr = $params;

            DB::beginTransaction();
            
            $sys_cat_tables = DB::table('sys_cat_tables')
                ->where('cat_table_id', '=', (int) $id)
                ->get();
                
            if ($sys_cat_tables->isEmpty()) {
                DB::rollback();
                return response()->json(['error' => 'Catálogo no encontrado'], 404);
            }
            
            $name_table = null;
            foreach ($sys_cat_tables as $value) {
                $name_table = $value->name_table;
            }
            
            if (empty($name_table)) {
                DB::rollback();
                return response()->json(['error' => 'Nombre de tabla no válido'], 400);
            }
            
            // Validate array is not empty
            if (empty($arr)) {
                DB::rollback();
                return response()->json(['error' => 'Datos a insertar vacíos'], 400);
            }
            
            DB::table($name_table)->insert($arr);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Error en create: ' . $e->getMessage());
            return response()->json(['error' => 'Error al crear registro'], 500);
        }


        $response = [
            "status" => 200,
            "message" => "Se creo correctamente el registro!",
            "type" => "success",
            "tipoComponent" => "notification",
            "sys_cat_tables" => $sys_cat_tables
        ];
        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function update($idcatalog, $idcolumn, Request $request)
    {
        $params = $request->all();
        // $arr = $params['parametros'];

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
        
        $arr = $params;

        $sys_cat_tables = DB::table('sys_cat_tables')->where('cat_table_id', $idcatalog)->get();
        foreach ($sys_cat_tables as $value) {
            $name_table = $value->name_table;
            $pk = $value->pk;
        }

        DB::table($name_table)->where($pk, $idcolumn)->update($arr);

        $response = [
            "status" => 200,
            "message" => "Se actualizo correctamente el registro!",
            "type" => "success",
            "tipoComponent" => "notification"
        ];

        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function delete($idcatalog, $idcolumn)
    {
        $sys_cat_tables = DB::table('sys_cat_tables')->where('cat_table_id', $idcatalog)->get();
        foreach ($sys_cat_tables as $value) {
            $name_table = $value->name_table;
            $pk = $value->pk;
        }

        DB::table($name_table)->where($pk, $idcolumn)->update(['status' => 'baja']);

        $response = [
            "status" => 200,
            "message" => "Se elimino correctamente el registro!",
            "type" => "success",
            "tipoComponent" => "notification"
        ];
        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }
}
