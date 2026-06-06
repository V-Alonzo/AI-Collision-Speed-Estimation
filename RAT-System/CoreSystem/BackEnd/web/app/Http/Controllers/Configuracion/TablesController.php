<?php

namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\MetaFritterVerso\FritterDynamic;
use Illuminate\Support\Facades\DB;

class TablesController extends Controller
{

    public function showAll()
    {
        $form = FritterDynamic::itemsForm('Fritter Tables');
        $columns = FritterDynamic::columnsTable('Tablas de sistema');
        $props_table = FritterDynamic::propsTable('Tablas de sistema');
        $raw = " SELECT  COUNT(component_no) FROM sys_data_tables WHERE table_id = sys_tables.table_id ";
        $data = DB::table('sys_tables')
            ->selectRaw('table_id, name_table, module, name_table as "sys_tables@name_table", module as "sys_tables@module", (' . $raw . ') AS total_elements')
            ->where('status', 'alta')
            ->where('editable', 1)
            ->orderby("sys_tables@module")
            ->orderby("sys_tables@name_table")
            ->get();

        $aux_data = [];

        foreach ($data as $value) {
            $propstable = DB::table('sys_props_table')
                ->join('sys_cat_props_table', 'sys_props_table.cat_props_table_id', '=', 'sys_cat_props_table.cat_props_table_id')
                ->where('sys_props_table.table_id', $value->table_id)
                ->get();

            $data_aux = json_decode(json_encode($value), true);
            foreach ($propstable as $prop) {
                if ($prop->value == "true") {
                    $value = boolval("1");
                } else if ($prop->value == "false") {
                    $value = boolval("0");
                } else {
                    $value = $prop->value;
                }
                $data_aux += [$prop->name_props_table => $value];
            }
            $aux_data[] = $data_aux;
        }

        $response = [
            "status" => 200,
            "data" => $aux_data,
            "formItems" => $form,
            "columns" => $columns,
            "props_table" => $props_table,
            "message" => "Info Actualizada",
            "type" => "success"
        ];
        // return response()->json($response);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function create(Request $request)
    {
        $params = $request->all();
        // $arr = $params['parametros'];
        $params = $params[0];
        $params = FritterDynamic::opensslDesEncrypt($params);
        // $arr = (array) json_decode($params);
        $arr = json_decode($params,true);

        $sys_tables = [];
        $sys_props_table = [];

        foreach ($arr as $key => $value) {
            $key = explode("@", $key);
            if (sizeof($key) > 1) {
                $key = $key[1];
                $sys_tables += [$key => $value];
            } else {
                $cat_props_table_id = DB::table('sys_cat_props_table')->where('name_props_table', $key)->get(['cat_props_table_id']);
                $value = is_bool($value) ? ($value ? 'true' : 'false')  : $value;
                $sys_props_table[] = ['cat_props_table_id' => $cat_props_table_id[0]->cat_props_table_id, 'value' =>   $value];
            }
        }

        $table_id = DB::table('sys_tables')->insertGetId($sys_tables);
        foreach ($sys_props_table as $syspt) {
            $syspt['table_id'] = $table_id;
            DB::table('sys_props_table')->insert($syspt);
        }

        $response = [
            "status" => 200,
            "message" => "Se creo correctamente el registro!",
            "type" => "success",
            "tipoComponent" => "notification",
            // "sys_tables" => $sys_tables,
            // "sys__props_table" => $sys_props_table
        ];
        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function update($id, Request $request)
    {
        $params = $request->all();
        // $arr = $params['parametros'];
        $params = $params[0];
        $params = FritterDynamic::opensslDesEncrypt($params);
        // $arr = (array) json_decode($params);
        $arr = json_decode($params,true);

        $sys_tables = [];
        $sys_props_table = [];

        $message = "Se modificó correctamente el registro!";

        foreach ($arr as $key => $value) {
            $key = explode("@", $key);
            if (sizeof($key) > 1) {
                $key = $key[1];
                if ($key == "status") {
                    $message = "Se elimino correctamente el registro!";
                }
                $sys_tables += [$key => $value];
            } else {
                if (!array_key_exists("sys_tables@status", $arr)) {
                    $cat_props_table_id = DB::table('sys_cat_props_table')->where('name_props_table', $key)->value('cat_props_table_id');
                    $value = is_bool($value) ? ($value ? 'true' : 'false')  : $value;
                    $sys_props_table[] = ['table_id' => $id, 'cat_props_table_id' => $cat_props_table_id, 'value' => $value];
                }
            }
        }
        DB::table('sys_tables')->where('table_id', $id)->update($sys_tables);
        if (!array_key_exists("sys_tables@status", $arr)) {
            foreach ($sys_props_table as $syspt) {
                $revisar = [];
                $actualizar = [];
                $revisar['table_id'] = $syspt['table_id'];
                $revisar['cat_props_table_id'] = $syspt['cat_props_table_id'];
                $actualizar['value'] = $syspt['value'];
                DB::table('sys_props_table')->updateOrInsert($revisar, $actualizar);
                //DB::table('sys_props_table')->upsert($syspt,['table_id','cat_props_table_id'],['value']);
            }
        }

        $response = [
            "status" => 200,
            "message" => $message,
            "type" => "success",
            "tipoComponent" => "notification"
        ];

        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function showColumn($id)
    {
        $form = FritterDynamic::itemsForm('Form Columnas');
        $columns = FritterDynamic::columnsTable('Agregar Columnas');
        $props_table = FritterDynamic::propsTable('Agregar Columnas');
        $sys_data_tables = DB::table('sys_data_tables')->where('table_id', $id)->orderby("order")->get();
        $data = [];
        $row = [];
        foreach ($sys_data_tables as $datatables) {
            
            $attributes = [];
            $row['data_table_id'] = $datatables->data_table_id;
            $row['table_id'] = $datatables->table_id;
            $row['component_no'] = $datatables->component_no;

            $components = DB::table('sys_components')
                ->join('sys_elements', 'sys_components.element_id', '=', 'sys_elements.element_id')
                ->join('sys_attributes_columns', 'sys_components.attribute_id', '=', 'sys_attributes_columns.attribute_column_id')
                ->select('sys_components.*', 'sys_elements.name_element', 'sys_attributes_columns.name_attribute_column')
                ->where('component_no', $datatables->component_no)->get();

            foreach ($components as $component) {
                if ($component->attribute_id == 3) {
                    $row['element_id'] = $component->element_id;
                    $row['columna'] = $component->value;
                    $row['label'] = $component->value;

                    break;
                } else if ($component->attribute_id == 2) {
                    $row['element_id'] = $component->element_id;
                    $row['columna'] = $component->value;
                    $row['label'] = $component->value;
                    
                    break;
                }
                
            }
            foreach ($components as $component) {
                $attributes[] = ['element_id' => $component->element_id, 'attribute_id' => $component->attribute_id, 'name_attribute_column' => $component->name_attribute_column, 'value' => $component->value];
            }

            $row['attributes'] = $attributes;
            array_push($data, $row);
        }

        $response = [
            "status" => 200,
            "data" => $data,
            "formItems" => $form,
            "columns" => $columns,
            "props_table" => $props_table,
            "message" => "Info Actualizada",
            "type" => "success"
        ];
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function showAttributes($id, Request $request)
    {
        if (isset($request->_dti)) {
            $component_id = $request->_dti;
            $raw = " sys_columns_attributes.*, sys_elements.*, sys_attributes_columns.*, ( SELECT sys_components.value FROM sys_components WHERE sys_components.attribute_id = sys_columns_attributes.attribute_column_id AND sys_components.component_no = $component_id ) as defaultValue, sys_attributes_columns.name_attribute_column as name_attribute ";
            if ($component_id == 0) {
                $raw = " sys_columns_attributes.*, sys_columns_attributes.default as defaultValue, sys_elements.*, sys_attributes_columns.*, sys_attributes_columns.name_attribute_column as name_attribute ";
            }
        }

        $columns = FritterDynamic::columnsTable('Agregar Atributos');
        $props_table = FritterDynamic::propsTable('Agregar Atributos');
        $data = DB::table('sys_columns_attributes')
            ->join('sys_elements', 'sys_columns_attributes.element_id', '=', 'sys_elements.element_id')
            ->join('sys_attributes_columns', 'sys_columns_attributes.attribute_column_id', '=', 'sys_attributes_columns.attribute_column_id')
            ->selectRaw($raw)
            ->where('sys_columns_attributes.element_id', $id)
            ->get();
        $form = [];
        $response = [
            "status" => 200,
            "data" => $data,
            "formItems" => $form,
            "columns" => $columns,
            "props_table" => $props_table,
            "message" => "Info Actualizada",
            "type" => "success"
        ];
        // return response()->json($response);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function createAttributes(Request $request)
    {
        $params = $request->all();
        // $arr = $params['parametros'];
        $params = $params[0];
        $params = FritterDynamic::opensslDesEncrypt($params);
        // $arr = (array) json_decode($params);
        $arr = json_decode($params, true);

        //DB::table('sys_components')->insert($arr);
        $no_componente = DB::table('sys_components')->orderByDesc('component_no')->first(['component_no']);

        foreach ($arr['component'] as $comp) {
            $comp['component_no'] = $no_componente->component_no + 1;
            DB::table('sys_components')->insert($comp);
        }
        //$order = DB::table('sys_data_forms')->where('form_id', $arr['form_id'])->orderByDesc('order')->first(['order']);
        $aux_order = DB::table('sys_data_tables')->where('table_id', $arr['table_id'])->orderByDesc('order')->first(['order']);
        $order = (is_null($aux_order)) ? 1 : ($aux_order->order + 1);
        $sys_data_tables = ["table_id" => $arr['table_id'], "component_no" => ($no_componente->component_no + 1), "order" => $order];
        DB::table('sys_data_tables')->insert($sys_data_tables);

        $response = [
            "status" => 200,
            "message" => "Se creo correctamente el registro!",
            "type" => "success",
            "tipoComponent" => "notification"
        ];
        // return response()->json($response, 200);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function updateAttributes(Request $request)
    {
        $params = $request->all();
        // $arr = $params['parametros'];
        $params = $params[0];
        $params = FritterDynamic::opensslDesEncrypt($params);
        // $arr = (array) json_decode($params);
        $arr = json_decode($params,true);
    
        $no_componente = $arr['component_no'];
        foreach ($arr['component'] as $comp) {
            // $comp['component_no'] = $no_componente;
            $revisar = [];
            $actualizar = [];
            $revisar['component_no'] = $no_componente;
            $revisar['element_id'] = $comp['element_id'];
            $revisar['attribute_id'] = $comp['attribute_id'];
            $revisar['type'] = $comp['type'];
            $actualizar['value'] = $comp['value'];
            DB::table('sys_components')->updateOrInsert($revisar, $actualizar);
        }
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

    public function deleteElement($id)
    {
        DB::table('sys_data_tables')->where('data_table_id', $id)->delete();
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
