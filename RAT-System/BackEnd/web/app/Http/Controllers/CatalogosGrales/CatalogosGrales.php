<?php

namespace App\Http\Controllers\CatalogosGrales;

use App\Http\Controllers\Controller;
use App\Models\UserData;
use App\Models\ViewUserData;
use Illuminate\Http\Request;
use App\MetaFritterVerso\FritterDynamic;
use App\MetaFritterVerso\TokenJWT;
use Illuminate\Support\Facades\DB;
use App\Models\BitCatGral;

class CatalogosGrales extends Controller
{
 public function getDataCatalogoGral($tipoCatalogo)
    {

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

        // Obtener catálogo general con sus columnas usando la relación hasMany()
        $catalogo = BitCatGral::where('codigo_access', $tipoCatalogo)->first();

        if (!$catalogo) {
            return response()->json([
                "status" => 404,
                "message" => "Catálogo no encontrado: $tipoCatalogo",
                "type" => "error",
            ]);
        }

        // Obtener las columnas del catálogo usando la relación
        $columnas = $catalogo->columnas()->get();

        // Agregar opciones dinámicas a cada columna que tenga cat_opciones
        $formItems = $columnas->map(function($columna) {
            $item = $columna->toArray();
            
            // Si la columna tiene cat_opciones definido, obtener las opciones
            if (!empty($columna->cat_opciones)) {
                $item['opciones'] = $columna->getOpciones();
            }
            
            return $item;
        })->toArray();

        // registrso de la tabla 
        $tabla = $catalogo->tabla;
        
        // Consultar registros con filtro por empresa si no es empresa 1
        $query = DB::table($tabla);
        if ($idCompany != 1) {
            $query->where('idemp', $idCompany);
        }
        $records = $query->get();

        // Normalizar registros: si el formItem es select, reemplazar valor por su label de opciones
        $recordsMapped = $records->map(function ($row) use ($formItems) {
            $record = (array) $row;

            foreach ($formItems as $item) {
                $field = $item['name'] ?? $item['columna'] ?? null;
                if (!$field || !array_key_exists($field, $record)) {
                    continue;
                }

                $isSelect = ($item['tipo_columna'] ?? '') === 'select';
                $options = $item['opciones'] ?? [];

                if ($isSelect && !empty($options)) {
                    $match = collect($options)->firstWhere('value', $record[$field]);
                    if ($match) {
                        $record[$field . '_label'] = $match['label'];
                    }
                }
            }

            return $record;
        });

        // Agregar icono de edición a cada registro
        $recordsMapped = $recordsMapped->map(function ($record) {
            $record['accion_icon'] = 'bxs:edit';
            return $record;
        });

        // Columnas visibles para tabla (solo las que existen en registros y formItems)
        $firstRecord = $recordsMapped->first() ? (array) $recordsMapped->first() : [];
        $tableColumns = collect($formItems)
            ->map(function ($item) {
                $field = $item['name'] ?? $item['columna'] ?? null;
                if (!$field) {
                    return null;
                }

                $isSelect = ($item['tipo_columna'] ?? '') === 'select';

                return [
                    'labelIndex' => $field,
                    'title' => $item['label'] ?? $field,
                    // Si es select y generamos <campo>_label, exponemos ese índice para mostrar texto
                    'dataIndex' => $isSelect ? $field . '_label' : $field,
                ];
            })
            ->filter(function ($col) use ($firstRecord) {
                return $col && array_key_exists($col['dataIndex'], $firstRecord);
            })
            ->values();

        // Columna adicional para acción editar (icono)
        $tableColumns->push([
            'actions' => '1',
            'titleMSG' => null,
            'width' => '40px',
            'fixed' => 'right',
            'Tooltip' => null,
            'icon' => 'bxs:edit',
            'title' => 'Editar',
            'key' => 'Editar',
            'dataIndex' => 'accion_icon',
        ]);

        // Propiedades de la tabla Ant Design
        $tableProps = [
            'IconAvatar' => 'svg-spinners:blocks-scale',
            'Title' => 'Catalogo - ' . $catalogo->catalogo,
            'bordered' => '1',
            'pagination' => true,
            'simplepage' => '',
            'dragSorting' => null,
            'size' => 'middle',
            'positionBottom' => 'bottomRight',
            'positionTop' => 'none',
            'tableLayout' => 'fixed',
            'virtual' => false,
            'tbSimple' => false,
        ];
            

        

        // Estructurar datos
        $data = [
            'formItems' => $formItems,
            'no_columnas' => $catalogo->no_columnas,
            'primaryKey' => $catalogo->campo_primario,
            'tableColumns' => $tableColumns,
            'recordsTable' => $recordsMapped,
            'tableProps' => $tableProps,          
        ];


        //RECORRER $records  PARA BUSCAR SU CAMPO EN $formItems Y VALIDAR SI EN EL CAMPO DE formItems ES SELECT QUE BUSQYE EL VALOR DE $RECORS EN LAS OPCIONES DE FORITEMS PARA REMPLACE EL VALOR POR SU TEXTO
        



        $response = [
            "status" => 200,
            "message" => "Información Actualizada",
            "type" => "success",
            "tipoCatalogo" => $tipoCatalogo,
            "data" => $data,
        ];

        $response = response()->json($response);
        $response = FritterDynamic::opensslEncrypt($response);
        return $response;
    }


    public function putCRUDCatalogo($tipoCatalogo, $accion, Request $request)
    {
        try {
            // Obtener los parámetros del request
            $params = $request->all();
            
            // Validar que exista el parámetro encriptado
            if (!isset($params[0]) || empty($params[0])) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Parámetros inválidos',
                    'type' => 'error'
                ], 400);
            }
            
            // Desencriptar el parámetro
            $decrypted = FritterDynamic::opensslDesEncrypt($params[0]);
            if (!$decrypted) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Error al desencriptar los datos',
                    'type' => 'error'
                ], 400);
            }
            
            // Decodificar el JSON
            $dataRequest = json_decode($decrypted, true);
            if (!is_array($dataRequest)) {
                return response()->json([
                    'status' => 400,
                    'message' => 'Formato de datos inválido',
                    'type' => 'error'
                ], 400);
            }

            // Aquí ya tienes los datos desencriptados en $dataRequest
            // Puedes acceder a ellos como: $dataRequest['campo']
            
            // Lógica para manejar la acción CRUD según el parámetro $accion
            $data = [
                'accion_realizada' => $accion,
                'tipoCatalogo' => $tipoCatalogo,
                'datos_recibidos' => $dataRequest,
            ];

            // Obtener tabla y campo primario del catálogo
            $catalogo = BitCatGral::where('codigo_access', $tipoCatalogo)->first();

            if (!$catalogo) {
                return response()->json([
                    'status' => 404,
                    'message' => 'No se encontró catálogo para este tipo',
                    'type' => 'error'
                ], 404);
            }

            $tabla = $catalogo->tabla;
            $campoPrimario = $catalogo->campo_primario;

            // Ejecutar acción CRUD
            switch ($accion) {
                case 'agregar':
                    // Inserta los valores recibidos en la tabla del catálogo
                    $idInsertado = DB::table($tabla)->insertGetId($dataRequest);
                    $data['id_insertado'] = $idInsertado;
                    break;
                case 'edit':
                    // Actualiza usando upsert basándose en el campo primario
                    if (empty($campoPrimario)) {
                        return response()->json([
                            'status' => 400,
                            'message' => 'Campo primario no configurado en el catálogo',
                            'type' => 'error'
                        ], 400);
                    }

                    // Obtener las columnas a actualizar
                    $camposActualizar = array_keys($dataRequest);
                    
                    // Ejecutar upsert
                    DB::table($tabla)->upsert(
                        [$dataRequest],
                        $campoPrimario,
                        $camposActualizar
                    );

                    $data['accion'] = 'actualizado';
                    $data['campo_primario'] = $campoPrimario;
                    break;
                default:
                    // Para otras acciones, solo retorna los datos recibidos
                    $data['nota'] = 'Acción no implementada';
//// aqui en este case

                    

                    break;
            }


            
            

            $response = [
                "status" => 200,
                "message" => "Información Actualizada",
                "type" => "success",
                "tipoCatalogo" => $tipoCatalogo,
                "tabla" => $tabla,
                "data" => $data,
            ];

            $response = response()->json($response);
            $response = FritterDynamic::opensslEncrypt($response);
            return $response;

        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Error del servidor: ' . $e->getMessage(),
                'type' => 'error'
            ], 500);
        }
    }

}