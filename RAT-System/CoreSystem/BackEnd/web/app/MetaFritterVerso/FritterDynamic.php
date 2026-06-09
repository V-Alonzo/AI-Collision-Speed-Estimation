<?php

namespace App\MetaFritterVerso;

use App\Models\FormData;
use App\Models\ColumnData;
use App\Models\PropsData;
use App\Models\ViewEstrucTable;
use App\Models\LogMonitor;
use Illuminate\Support\Facades\DB;



class FritterDynamic {

    //public static $forms = [];

    function __construct() {
        
    }

    static function itemsForm($name_form) {
        $formItems = FormData::where("name_form", $name_form)->get();
        $noComponents = FormData::where("name_form", $name_form)->distinct()->get(['component_no']);

        $forms = [];

        foreach ($noComponents as $value) {
            $component_no = $value['component_no'];
            $obj = [];

            foreach ($formItems as $item) {
                if ($item['component_no'] == $component_no) {
                    $obj += [$item['name_attribute'] => $item['value']];
                    $obj['name_element'] = $item['name_element'];
                    $dependency = (int) $item['dependency'];
                }
            }
            if ($dependency > 0) {
                $dependecys = DB::table('sys_dependencys')->where('component_id', $component_no)->get();
                foreach ($dependecys as $dep) {
                    $dependency_combo = DB::table('sys_dependencys_combos')->where('dependency_combo_id', $dep->dependency_combo_id)->get();
                    foreach ($dependency_combo as $dep_combo) {
                        if ($dep_combo->name_table == "type_catalog") {
                            $obj['options'] = [['label' => 'system', 'value' => 'system'], ['label' => 'operation', 'value' => 'operation']];
                        } else {
                            $combos = [];
                            $combos = DB::table($dep_combo->name_table)->select($dep_combo->label . ' as label', $dep_combo->value . ' as value')->orderBy('label');

                            if ($dep->parent > 0) {

                                $name_combo_parent = DB::table("sys_dependencys_combos")->where('dependency_combo_id', $dep->parent)->value("name_table");
                                $id_combo_parent = DB::table("sys_dependencys_combos")->where('dependency_combo_id', $dep->parent)->value("value");
                                $combo_parent = DB::table($name_combo_parent)->get([$id_combo_parent]);

                                if ($dep_combo->where == "" || $dep_combo->where == null) {
                                    $combos = $combos->select($dep_combo->label . ' as label', $dep_combo->value . ' as value', $id_combo_parent)->orderBy('label')->get();
                                } else {
                                    $combos = $combos->select($dep_combo->label . ' as label', $dep_combo->value . ' as value', $id_combo_parent)->whereRaw($dep_combo->where, [])->orderBy('label')->get();
                                }

                                foreach ($combo_parent as $combop) {
                                    $id_relacional = $combop->$id_combo_parent;
                                    foreach ($combos as $combo) {
                                        if ($id_relacional == $combo->$id_combo_parent) {
                                            $combo->value_parent = $id_relacional;
                                        }
                                    }
                                }
                            } else {
                                if ($dep_combo->where == "" || $dep_combo->where == null) {
                                    $combos = $combos->get();
                                } else {
                                    $combos = $combos->whereRaw($dep_combo->where, [])->get();
                                }
                            }
                            $array = json_decode(json_encode($combos), true);
                            $obj['options'] = array_map(function ($a) {
                                if (array_key_exists('value_parent', $a)) {
                                    return ['label' => $a['label'], 'value' => $a['value'], 'value_parent' => $a['value_parent']];
                                }
                                return ['label' => $a['label'], 'value' => $a['value']];
                            }, $array);
                        }
                    }
                    $obj['parent'] = DB::table("sys_dependencys_combos")->where('dependency_combo_id', $dep->parent)->value("value");
                    ;
                    $obj['children'] = DB::table("sys_dependencys_combos")->where('dependency_combo_id', $dep->children)->value("value");
                }
            }

            $forms[] = $obj;
        }

        return $forms;
    }

    static function columnsPropsTable($name_table) {
        $formItems =    ViewEstrucTable::where("name_table", $name_table)->get(['component_no', 'name_value','value' ]);        
         $DataCatalogo =  $formItems;
         $noComponents = $DataCatalogo->groupBy('component_no');
       
        $columns = [];
        $Props = [];
       
         foreach ($noComponents as $value) {             
            $obj = [];            
            $component_no = $value[0]['component_no'];            
            foreach ($value as $item) {                
                  $value = ($item['value'] == "true") ? boolval("1")  : (($item['value'] == "false") ? boolval("0") : $item['value']);                                
                  $obj += [$item['name_value'] => $value];               
            }   
            $component_no > 0 ? $columns[] = $obj : $Props[] = $obj;                 
         }         
        return [$columns, $Props[0]];    
    }
    
    static function columnsTable($name_table) {
        $formItems =    ColumnData::where("name_table", $name_table)->get(['component_no', 'name_attribute_column','value' ]);
        
         $DataCatalogo =  $formItems;
         $noComponents = $DataCatalogo->groupBy('component_no');
        //$noComponents = ColumnData::where("name_table", $name_table)->distinct()->get(['component_no']); /// se comentario para evitar dobel consulta
        
        
       

        $columns = [];
        
         foreach ($noComponents as $value) {             
            $obj = [];
            foreach ($value as $item) {                
                  $value = ($item['value'] == "true") ? boolval("1")  : (($item['value'] == "false") ? boolval("0") : $item['value']);                                
                  $obj += [$item['name_attribute_column'] => $value];               
            }                  
            $columns[] = $obj;
             
         }

//        foreach ($noComponents as $value) {
//            //$component_no = $value['component_no'];/// se comentario para evitar dobel consulta
//            $component_no = $value[0]['component_no'];
//            $obj = [];
//
//               ////// filtra del 
//            $formItemsD = $formItems->filter(function ($item) use($component_no) {
//                return $item->component_no == $component_no;
//            });
//            
//            foreach ($formItemsD as $item) {                
//                  $value = ($item['value'] == "true") ? boolval("1")  : (($item['value'] == "false") ? boolval("0") : $item['value']);                                
//                  $obj += [$item['name_attribute_column'] => $value];
//               
//            }
//            $columns[] = $obj;
//        }

        return $columns;
    }

    static function propsTable($name_table) {
//        $table_id = DB::table('sys_tables')->where('name_table', $name_table)->value('table_id');
//        $props = DB::table('sys_props_table')
//                ->join('sys_cat_props_table', 'sys_props_table.cat_props_table_id', '=', 'sys_cat_props_table.cat_props_table_id')
//                ->select('sys_props_table.value', 'sys_cat_props_table.name_props_table')
//                ->where('table_id', $table_id)
//                ->get();
        
        $props = PropsData::where('name_table', $name_table)->get(['value', 'name_props_table']);

        $props_table = [];
        foreach ($props as $prop) {
            if ($prop->value == "true") {
                $value = boolval("1");
            } else if ($prop->value == "false") {
                $value = boolval("0");
            } else {
                $value = $prop->value;
            }

            //$value = $prop->value == "false" ? boolval("0") : $prop->value;
            $props_table += [$prop->name_props_table => $value];
        }
        return $props_table;
    }

    static function getSecretIV() {
        return $getSecretIV =  env("ENCRYPTION_IV", "IV-Seguridad-CesviMex2025");
    }

    static function getPassCrypto() {
        return $password = env("ENCRYPTION_PASSWORD", "cesvi-SuperSecretPassword-2025");
    }

    static function opensslEncrypt($data) {        
        $SecretIV = openssl_digest(FritterDynamic::getSecretIV(), "SHA1");
        $keyEncrypt = openssl_digest(FritterDynamic::getPassCrypto(), "SHA256");
        // Method
        $method = "AES-256-CBC";
        // Prepare substances
        $SecretIV = substr(base64_encode(hex2bin($SecretIV)), 0, 16);
        $keyEncrypt = substr(base64_encode(hex2bin($keyEncrypt)), 0, 32);
        // Cipher
        $encrypted = openssl_encrypt($data, $method, $keyEncrypt, 0, $SecretIV);
        return $encrypted;
    }

    static function opensslDesEncrypt($data) {
                              
        $SecretIV = openssl_digest(FritterDynamic::getSecretIV(), "SHA1");
        $keyEncrypt = openssl_digest(FritterDynamic::getPassCrypto(), "SHA256");

        // Method
        $method = "AES-256-CBC";
                      
        // Prepare substances
        $SecretIV = substr(base64_encode(hex2bin($SecretIV)), 0, 16);
        $keyEncrypt = substr(base64_encode(hex2bin($keyEncrypt)), 0, 32);
 
        
        // Cipher
        $descrypted = openssl_decrypt($data, $method, $keyEncrypt, 0, $SecretIV);
           return $descrypted;
    }
    
    /*
    *  function para generar cadenas aleatorias alfanumericas
    */
      static function getCadenaAleatoria($nuCaracteres, $prefijo){
        $permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $cadena = $prefijo . "_";
        for ($i = 0; $i < $nuCaracteres; $i++) {
            $cadena .= $permitted_chars[random_int(0, strlen($permitted_chars) - 1)];
        }
        return $cadena;
    }

       /*
    *  function para generar codigo de activacion con formato xxxxx-xxxxx-xxxxx-xxxxx
    */
      static function getCodigoActivacion(){
        $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $code = '';
        for ($i = 0; $i < 4; $i++) {
            $part = '';
            for ($j = 0; $j < 5; $j++) {
                $part .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $code .= ($i > 0 ? '-' : '') . $part;
        }
        return $code;
    }

     /*
    *  function para generar cadenas aleatorias alfanumericas
    */
      static function regLodMonitor($tipo, $username, $id_keycloak, $consulta){
       LogMonitor::create([
           'tipo' => $tipo,
           'usuario' => $username,
           'id_keycloak' => $id_keycloak,
           'consulta' => $consulta
       ]);
        return 200;
    }

    /*
    *  function para enviar correo via API
    */
        static function apiEnviaCorreo($Emails, $Subjet, $Body,  $fromName) {


        $curl = curl_init();

        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);

        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://cesvitalleres.cesvimexico.com.mx/apimail/',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => array(
                'action' => 'mail',
                'emails' => $Emails,
                'subject' => $Subjet,
                'body' => $Body,
                'fromname' => $fromName
            ),
            CURLOPT_HTTPHEADER => array(
                'Authorization: Basic ' . env('EMAIL_API_AUTH', '')
            ),
        ));

        $response = curl_exec($curl);
        //var_dump($curl);
        curl_close($curl);

        return $response;
    }
    

}
