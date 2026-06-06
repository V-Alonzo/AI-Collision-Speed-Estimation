<?php

namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\MetaFritterVerso\FritterDynamic;
use Illuminate\Support\Facades\DB;

class FormsController extends Controller
{

    public function showAll()
    {
        $form = FritterDynamic::itemsForm('Fritter Forms');
        $columns = FritterDynamic::columnsTable('Agregar Forms');
        $props_table = FritterDynamic::propsTable('Agregar Forms');
        $raw = " SELECT  COUNT(component_no) FROM sys_data_forms WHERE form_id = sys_forms.forms_id ";
        $data = DB::table('sys_forms')->selectRaw('forms_id, name_form, module, (' . $raw . ') AS total_elements')->where('status', 'alta')->where('editable', 1)->get();

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

    public function create(Request $request)
    {
        try {
            $params = $request->all();
            if (!isset($params[0]) || empty($params[0])) {
                return response()->json(['error' => 'Invalid parameters'], 400);
            }
            $decrypted = FritterDynamic::opensslDesEncrypt($params[0]);
            if (!$decrypted) {
                return response()->json(['error' => 'Decryption failed'], 400);
            }
            $arr = json_decode($decrypted, true);
            if (!is_array($arr)) {
                return response()->json(['error' => 'Invalid JSON'], 400);
            }
            DB::beginTransaction();
            DB::table('sys_forms')->insert($arr);
            DB::commit();
            $response = [
                "status" => 200,
                "message" => "Se creo correctamente el registro!",
                "type" => "success",
                "tipoComponent" => "notification"
            ];
            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Create forms error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    public function update($id, Request $request)
    {
        try {
            $params = $request->all();
            if (!isset($params[0]) || empty($params[0])) {
                return response()->json(['error' => 'Invalid parameters'], 400);
            }
            $decrypted = FritterDynamic::opensslDesEncrypt($params[0]);
            if (!$decrypted) {
                return response()->json(['error' => 'Decryption failed'], 400);
            }
            $arr = json_decode($decrypted, true);
            if (!is_array($arr)) {
                return response()->json(['error' => 'Invalid JSON'], 400);
            }
            DB::beginTransaction();
            DB::table('sys_forms')
                ->where('forms_id', $id)
                ->update($arr);
            DB::commit();

            $message = "Se modificó correctamente el registro!";
            if (array_key_exists("status", $arr)) {
                $message = "Se elimino correctamente el registro!";
            }

            $response = [
                "status" => 200,
                "message" => $message,
                "type" => "success",
                "tipoComponent" => "notification"
            ];

            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Update forms error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    public function showElement($id)
    {
        $form = FritterDynamic::itemsForm('Form Elementos');
        $columns = FritterDynamic::columnsTable('Agregar Elementos');
        $props_table = FritterDynamic::propsTable('Agregar Elementos');
        $sys_data_forms = DB::table('sys_data_forms')->where('form_id', $id)->get();
        $data = [];
        $row = [];
        foreach ($sys_data_forms as $dataform) {
            $attributes = [];
            $row['data_form_id'] = $dataform->data_form_id;
            $row['form_id'] = $dataform->form_id;
            $row['component_no'] = $dataform->component_no;
            $components = DB::table('sys_components')
                ->join('sys_elements', 'sys_components.element_id', '=', 'sys_elements.element_id')
                ->join('sys_attributes', 'sys_components.attribute_id', '=', 'sys_attributes.attribute_id')
                ->select('sys_components.*', 'sys_elements.name_element', 'sys_attributes.name_attribute')
                ->where('component_no', $dataform->component_no)->get();
            foreach ($components as $component) {
                if ($component->attribute_id == 1) {
                    $row['element_id'] = $component->element_id;
                    $row['name_element'] = $component->name_element;
                    $row['label'] = $component->value;
                }
                $attributes[] = ['element_id' => $component->element_id, 'attribute_id' => $component->attribute_id, 'name_attribute' => $component->name_attribute, 'value' => $component->value];
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
        // return response()->json($response);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function showAttributes($id, Request $request)
    {
        if (isset($request->_dfi)) {
            $component_id = $request->_dfi;
            $raw = " sys_elements_attributes.*, sys_elements.*, sys_attributes.*, ( SELECT sys_components.value FROM sys_components WHERE sys_components.attribute_id = sys_elements_attributes.attribute_id AND sys_components.component_no = $component_id ) as defaultValue ";
            if ($component_id == 0) {
                $raw = " sys_elements_attributes.*, sys_elements_attributes.default as defaultValue, sys_elements.*, sys_attributes.* ";
            }
        }

        $columns = FritterDynamic::columnsTable('Agregar Atributos');
        $props_table = FritterDynamic::propsTable('Agregar Atributos');
        $data = DB::table('sys_elements_attributes')
            ->join('sys_elements', 'sys_elements_attributes.element_id', '=', 'sys_elements.element_id')
            ->join('sys_attributes', 'sys_elements_attributes.attribute_id', '=', 'sys_attributes.attribute_id')
            ->selectRaw($raw)
            ->where('sys_elements_attributes.element_id', $id)
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
        // $arr = json_decode($params,true);
        $arr = json_decode($params,true);

        //DB::table('sys_components')->insert($arr);
        $no_componente = DB::table('sys_components')->orderByDesc('component_no')->first(['component_no']);
        $dependecys_combos = [];
        $dependecys = [];        
        foreach ($arr['component'] as $comp) {
            $comp['component_no'] = $no_componente->component_no + 1;
            // $attribute_id = $comp->attribute_id;
            $attribute_id = $comp["attribute_id"];
            $array_attibutes_id = [19, 20, 21, 22, 23, 24];
            if (in_array($attribute_id, $array_attibutes_id)) {
                $name_attribute =  DB::table('sys_attributes')->where('attribute_id', $attribute_id)->value('name_attribute');
                $dependecys_combos[str_replace("_option", "", $name_attribute)] = $comp['value'];
            }
            $array_attibutes_id_children = [24];
            if (in_array($attribute_id, $array_attibutes_id_children)) {
                $name_attribute =  DB::table('sys_attributes')->where('attribute_id', $attribute_id)->value('name_attribute');
                $dependecys[$name_attribute] = $comp['value'];
                DB::table('sys_components')->where('componenet_id')->update(["parent" => $comp['value']]);
            }
            DB::table('sys_components')->insert($comp);
        }
        $dependecy = 0;
        if (sizeof($dependecys_combos) > 0) {
            $dependency_combo_id =  DB::table('sys_dependencys_combos')->insertGetId($dependecys_combos);
             ///// insert en sys_dependencys
            $no = $no_componente->component_no + 1;           
            $dataInsert = [
                            "component_id" => $no,
                            "dependency_combo_id" => $dependency_combo_id
                        ];
             DB::table('sys_dependencys')->insert($dataInsert);
            
            $dependecys['component_id'] = $no_componente->component_no + 1;
            $dependecys['dependency_combo_id'] = $dependency_combo_id;
            $dependecy = 1;
        }

        $aux_order = DB::table('sys_data_forms')->where('form_id', $arr['form_id'])->orderByDesc('order')->first(['order']);
        $order = (is_null($aux_order)) ? 1 : ($aux_order->order + 1);
        $sys_data_forms = ["form_id" => $arr['form_id'], "component_no" => ($no_componente->component_no + 1), "order" => $order, "dependency" => $dependecy];
        DB::table('sys_data_forms')->insert($sys_data_forms);

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
        $arr = json_decode($params,true);

        $no_componente = $arr['component_no'];
        $dependecys = [];
        foreach ($arr['component'] as $comp) {
            // $comp['component_no'] = $no_componente;
            $revisar = [];
            $actualizar = [];
            $revisar['component_no'] = $no_componente;
            $revisar['element_id'] = $comp['element_id'];
            $revisar['attribute_id'] = $comp['attribute_id'];
            $revisar['type'] = $comp['type'];
            $actualizar['value'] = $comp['value'];

            $attribute_id = $comp['attribute_id'];
            $array_attibutes_id = [19, 20, 21, 22, 27];
            if (in_array($attribute_id, $array_attibutes_id)) {
                $name_attribute =  DB::table('sys_attributes')->where('attribute_id', $attribute_id)->value('name_attribute');
                $dependecys[str_replace("_option", "", $name_attribute)] = $comp['value'];
            }
            DB::table('sys_components')->updateOrInsert($revisar, $actualizar);
        }

        if (sizeof($dependecys) > 0) {
            // $dependecys['component_id'] = $no_componente;
            // DB::table('sys_dependencys')->update($dependecys,['component_id']);
            DB::table('sys_dependencys')->where('component_id', $no_componente)->update($dependecys);
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
        DB::table('sys_data_forms')->where('data_form_id', $id)->delete();
        $response = [
            "status" => 200,
            "message" => "Se elimino correctamente el registro!",
            "type" => "success",
            "tipoComponent" => "notification"
        ];
        // return response()->json($response, 200);1
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }

    public function combos()
    {
        $data = DB::table('sys_dependencys_combos')->selectRaw('dependency_combo_id as value, alias_combo as label')->where('status', 'alta')->get();

        $response = [
            "status" => 200,
            "data" => $data,
            "message" => "Info Actualizada",
            "type" => "success"
        ];
        // return response()->json($response);
        $response  = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }
}
