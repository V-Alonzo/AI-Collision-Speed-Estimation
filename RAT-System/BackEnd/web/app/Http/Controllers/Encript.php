<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\MetaFritterVerso\FritterDynamic;


class Encript extends Controller
{

    public function index($id)
    {
        try {
            if (empty($id)) {
                return response()->json(['error' => 'Invalid ID'], 400);
            }
            
            $id = FritterDynamic::opensslDesEncrypt($id);
            
            if (!$id) {
                return response()->json(['error' => 'Decryption failed'], 400);
            }
              
            $response = [
                "status" => 200,
                "message" => "Informacion Actualizada de usuarios ",
                "type" => "success",
                "params" => $id
            ];
            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
        } catch (\Exception $e) {
            \Log::error('Encript index error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }
    
     public function parametros(Request $request)
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
            
            $params = json_decode($decrypted, true);
            if (!is_array($params)) {
                return response()->json(['error' => 'Invalid JSON format'], 400);
            }
              
            $response = [
                "status" => 200,
                "message" => "Informacion Actualizada de usuarios ",
                "type" => "success",
                "params" => $params
            ];
            $response  = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;
        } catch (\Exception $e) {
            \Log::error('Encript parametros error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

   
}
