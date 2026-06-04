<?php

namespace App\Http\Controllers\Configuracion;

use App\Models\SisCatCompanys;
use App\Models\CatConstantes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\MetaFritterVerso\FritterDynamic;
use Illuminate\Support\Facades\DB;

class PreferenciasController extends Controller
{

    public function create(Request $request)
    {
         // Desencripta el payload recibido
        $payloadEnc = $request->input('payload');
        $payloadJson = FritterDynamic::opensslDesEncrypt($payloadEnc);
        $payload = json_decode($payloadJson, true);

        // Valida estructura minima
        if (!$payload || !isset($payload['id_company'])) {
            $response = [
                "status" => 422,
                "message" => "Payload invalido",
                "type" => "error",
                "tipoComponent" => "notification"
            ];
            $response  = response()->json($response, 422);
            return FritterDynamic::opensslEncrypt($response);
        }

        // Solo toma campos permitidos
        $allowedKeys = [
            'company',
            'primary_color',
            'secondary_color',
            'text_color_primario',
            'text_color_secundario',
        ];
        $updateData = array_intersect_key($payload, array_flip($allowedKeys));

        if (empty($updateData)) {
            $response = [
                "status" => 422,
                "message" => "No hay campos para actualizar",
                "type" => "warning",
                "tipoComponent" => "notification"
            ];
            $response  = response()->json($response, 422);
            return FritterDynamic::opensslEncrypt($response);
        }

        $updated = SisCatCompanys::where('id_company', $payload['id_company'])->update($updateData);

        $responseIcono = "";
        $responseLogo = "";
        $conIcono = "no";
        $conLogo = "no";

        // Procesar archivo ICONO
        if ($request->hasFile('icono')) {
            $file = $request->file('icono');
            $conIcono = $file->getClientOriginalName();
            
            $result = $this->uploadFileToStorage($file, 'icono');
            if ($result['error']) {
                return response()->json($result['response'], 500);
            }
            
            $responseIcono = $result['rawResponse'];
            $updateDataIcono = ['icono' => $result['uid']];
            $updated = SisCatCompanys::where('id_company', $payload['id_company'])->update($updateDataIcono);
        }

        // Procesar archivo LOGO
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $conLogo = $file->getClientOriginalName();
            
            $result = $this->uploadFileToStorage($file, 'logo');
            if ($result['error']) {
                return response()->json($result['response'], 500);
            }
            
            $responseLogo = $result['rawResponse'];
            $updateDataLogo = ['logo' => $result['uid']];
            $updated = SisCatCompanys::where('id_company', $payload['id_company'])->update($updateDataLogo);
        }



        $response = [
            "status" => $updated ? 200 : 404,
            "message" => $updated ? "Se actualizo correctamente el registro!" : "No se encontro la empresa",
            "type" => $updated ? "success" : "warning",
            "tipoComponent" => "notification",
            "payload" => [
                "id_company" => $payload['id_company'],
                "changes" => $updateData
            ],
            "responseIcono" => $responseIcono,
            "responseLogo" => $responseLogo,
            "conIcono" => $conIcono,
            "conLogo" => $conLogo
        ];

        $response  = response()->json($response, $updated ? 200 : 404);
        return FritterDynamic::opensslEncrypt($response);
    }



      public function UpdatePreferenciasModelos(Request $request)
    {
        
        $params = $request->all();
        // $arr = $params['parametros'];
        $params = $params[0];
        $params = FritterDynamic::opensslDesEncrypt($params);
        // $arr = (array) json_decode($params);
        $arr = json_decode($params,true);

        $idConstante = 0;
        if($arr["name"] == "reconocimiento_vin"){
            $idConstante = 1;
        }else if($arr["name"] == "anonimizar_vin"){
            $idConstante = 2;
        }else if($arr["name"] == "anonimizar_placas"){
            $idConstante = 3;
        }else if($arr["name"] == "anonimizar_rostros"){
            $idConstante = 4;
        }

        CatConstantes::where('id_constante', $idConstante)
            ->update(['valor_boleano' => $arr["checked"]]);

        $response = [
            "status" => 200 ,
            "message" => "Se actualizo correctamente el UpdatePreferenciasModelos!",
            "type" => "success",
            "tipoComponent" => "notification",
            "arr" => $arr["name"] 
           
        ];

        $response  = response()->json($response, 200);
        return FritterDynamic::opensslEncrypt($response);
    }

    
  public function apiConsultaDataConstantes(Request $request)
    {
        
        $cosntantes = CatConstantes::whereIn('id_constante', [1,2,3,4])->OrderBy('id_constante')->get();


        $response = [
            "status" => 200 ,
            "message" => "Se actualizo correctamente el UpdatePreferenciasModelos!",
            "type" => "success",
            "tipoComponent" => "notification",
            "Cosntantes" => $cosntantes,
            "reconocimiento_vin" => $cosntantes[0]->valor_boleano,
            "anonimizar_vin" => $cosntantes[1]->valor_boleano,
            "anonimizar_placas" => $cosntantes[2]->valor_boleano,
            "anonimizar_rostros" => $cosntantes[3]->valor_boleano,

           
        ];

        $response  = response()->json($response, 200);
        return FritterDynamic::opensslEncrypt($response);
    }




    /**
     * Sube un archivo al storage externo via cURL
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $fileType Tipo de archivo (icono/logo) para mensajes de error
     * @return array ['error' => bool, 'uid' => string|null, 'rawResponse' => string, 'response' => array]
     */
    private function uploadFileToStorage($file, $fileType)
    {
        $url = rtrim(env('FILES_BASE_URL'), '/');
        $filePath = $file->getRealPath();
        $fileName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        
        $curl = curl_init();           
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [
                'file' => new \CURLFile(
                    $filePath,
                    $mimeType,
                    $fileName
                ),
                'path' => '/VINCrashTrace/logos'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        $response = curl_exec($curl);

        if ($response === false) {
            $error = curl_error($curl);
            curl_close($curl);
            return [
                'error' => true,
                'response' => [
                    'error' => "Error subiendo {$fileType}: {$error}"
                ],
                'uid' => null,
                'rawResponse' => ''
            ];
        }

        curl_close($curl);
        $responseData = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'error' => true,
                'response' => [
                    'error' => "La API no devolvió un JSON válido para {$fileType}",
                    'raw_response' => $response
                ],
                'uid' => null,
                'rawResponse' => $response
            ];
        }

        if (!isset($responseData['uid'])) {
            return [
                'error' => true,
                'response' => [
                    'error' => "La API no devolvió uid para {$fileType}",
                    'response' => $responseData
                ],
                'uid' => null,
                'rawResponse' => $response
            ];
        }
        
        return [
            'error' => false,
            'uid' => $responseData['uid'],
            'rawResponse' => $response,
            'response' => $responseData
        ];
    }

   

   
}
