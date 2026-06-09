<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use App\Models\Rat\{
    Incidente, Vehiculo, IncidenteVehiculo, OcupacionCarga,
    UbicacionVia, HuellaEscena, Foto,
    DeformacionMedicion, CalculoVelocidad,
    NarrativaDinamica, FaseAccidente,
    PrincipiosForenses, Conclusion, Reporte
};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ExpedienteWizardController extends Controller
{
    private function lumenValidate(Request $request, array $rules, array $messages = []): array
    {
        $defaultMessages = [
            'required'        => 'El campo :attribute es obligatorio.',
            'integer'         => 'El campo :attribute debe ser un número entero.',
            'numeric'         => 'El campo :attribute debe ser un valor numérico.',
            'min'             => 'El valor de :attribute no puede ser menor a :min.',
            'max'             => 'El valor de :attribute no puede ser mayor a :max.',
            'between'         => 'El valor de :attribute debe estar entre :min y :max.',
            'string'          => 'El campo :attribute debe ser texto.',
            'exists'          => 'El valor seleccionado para :attribute no es válido.',
            'unique'          => 'El :attribute ya existe en el sistema.',
            'date'            => 'El campo :attribute debe ser una fecha válida.',
            'in'              => 'El valor de :attribute no es una opción permitida.',
            'anio_modelo.min' => 'El año del vehículo no puede ser anterior a 1886.',
            'anio_modelo.max' => 'El año del vehículo no puede ser mayor a 2028.',
            'numero_mediciones.min' => 'El número de mediciones debe ser al menos 1.',
            'numero_mediciones.max' => 'El número de mediciones no puede ser mayor a 20.',
        ];
        $this->validate($request, $rules, array_merge($defaultMessages, $messages));
        return $request->all();
    }

    private function isAdmin(Request $request): bool
    {
        $user = $request->attributes->get('user');
        return ($user->email ?? '') === 'admin@cesvi.com';
    }

    private function checkOwnership(Request $request, Incidente $incidente): void
    {
        if ($this->isAdmin($request)) return;

        $user = $request->attributes->get('user');
        if ($incidente->id_usuario_perito != ($user->id_user ?? null)) {
            abort(403, 'No tienes permiso para editar este expediente.');
        }
    }

    public function storePaso1(Request $request): JsonResponse
    {
        // Forzar id_usuario_perito desde el JWT (evita suplantación)
        $jwtUser = $request->attributes->get('user');
        $request->merge(['id_usuario_perito' => $jwtUser->id_user ?? null]);

        $data = $this->lumenValidate($request, [
            'numero_siniestro'         => 'required|string|max:100|unique:RAT_INCIDENTE,numero_siniestro',
            'fecha_hecho'              => 'required|date|before_or_equal:today',
            'hora_hecho'               => 'nullable|date_format:H:i,H:i:s',
            'tipo_hecho_id'            => 'required|exists:RAT_CAT_TIPO_HECHO,id',
            'tipo_hecho_descripcion'   => 'nullable|string|max:300',
            'id_usuario_perito'        => 'required|exists:sys_users,id_user',
            'estado'                   => 'sometimes|integer|in:0,1,2',
        ], [
            'fecha_hecho.before_or_equal' => 'La fecha del hecho no puede ser una fecha futura.',
        ]);
        $incidente = Incidente::create($data);

        $stubVin      = 'TMP_' . substr(str_replace('-', '', $incidente->uuid), 0, 13);
        $stubVehiculo = Vehiculo::create([
            'vin'           => $stubVin,
            'marca'         => 'Por definir',
            'anio_modelo'   => (int) date('Y'),
            'tipo_vehiculo' => 'ligero',
        ]);
        IncidenteVehiculo::create([
            'incidente_id' => $incidente->id,
            'vehiculo_id'  => $stubVehiculo->id,
            'rol'          => 'A',
        ]);

        return response()->json([
            'message'          => 'Paso 1 guardado.',
            'incidente_uuid'   => $incidente->uuid,
            'numero_siniestro' => $incidente->numero_siniestro,
        ], 201);
    }

    public function updatePaso1(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $data = $this->lumenValidate($request, [
            'numero_siniestro'         => 'sometimes|string|max:100|unique:RAT_INCIDENTE,numero_siniestro,'.$incidente->id,
            'fecha_hecho'              => 'sometimes|date|before_or_equal:today',
            'hora_hecho'               => 'nullable|date_format:H:i,H:i:s',
            'tipo_hecho_id'            => 'sometimes|exists:RAT_CAT_TIPO_HECHO,id',
            'tipo_hecho_descripcion'   => 'nullable|string|max:300',
            'estado'                   => 'sometimes|integer|in:0,1,2',
        ]);
        // Nunca permitir cambiar el propietario desde el wizard
        unset($data['id_usuario_perito']);
        $incidente->update($data);
        return response()->json(['message' => 'Paso 1 actualizado.', 'data' => $incidente]);
    }

    public function updatePaso2(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $data = $this->lumenValidate($request, [
            'vin'                       => 'required|string|max:17',
            'marca'                     => 'required|string|max:100',
            'submarca'                  => 'nullable|string|max:100',
            'nombre_modelo'             => 'nullable|string|max:200',
            'anio_modelo'               => 'required|integer|min:1886|max:2030',
            'tipo_vehiculo'             => 'required|in:ligero,pesado',
            'peso_tara_kg'              => 'nullable|numeric|min:0',
            'masa_maxima_autorizada_kg' => 'nullable|numeric|min:0',
            'ancho_mm'                  => 'nullable|numeric|min:0',
            'largo_mm'                  => 'nullable|numeric|min:0',
            'alto_mm'                   => 'nullable|numeric|min:0',
            'batalla_mm'                => 'nullable|numeric|min:0',
            'entrevia_delantera_mm'     => 'nullable|numeric|min:0',
            'entrevia_trasera_mm'       => 'nullable|numeric|min:0',
            'numero_placas'             => 'nullable|string|max:20',
            'color_id'                  => 'nullable|exists:RAT_CAT_COLOR,id',
            'estado_neumatico_id'       => 'nullable|exists:RAT_CAT_ESTADO_NEUMATICO,id',
            'rol'                       => 'required|in:A,B,C',
        ]);

        $vehiculoData = [
            'marca'                     => $data['marca'],
            'submarca'                  => $data['submarca'] ?? null,
            'nombre_modelo'             => $data['nombre_modelo'] ?? null,
            'anio_modelo'               => $data['anio_modelo'],
            'tipo_vehiculo'             => $data['tipo_vehiculo'],
            'peso_tara_kg'              => $data['peso_tara_kg'] ?? null,
            'masa_maxima_autorizada_kg' => $data['masa_maxima_autorizada_kg'] ?? null,
            'ancho_mm'                  => $data['ancho_mm'] ?? null,
            'largo_mm'                  => $data['largo_mm'] ?? null,
            'alto_mm'                   => $data['alto_mm'] ?? null,
            'batalla_mm'                => $data['batalla_mm'] ?? null,
            'entrevia_delantera_mm'     => $data['entrevia_delantera_mm'] ?? null,
            'entrevia_trasera_mm'       => $data['entrevia_trasera_mm'] ?? null,
        ];

        $ivData = [
            'numero_placas'       => $data['numero_placas'] ?? null,
            'color_id'            => $data['color_id'] ?? null,
            'estado_neumatico_id' => $data['estado_neumatico_id'] ?? null,
            'rol'                 => $data['rol'],
        ];

        $iv             = IncidenteVehiculo::where('incidente_id', $incidente->id)->orderBy('id')->first();
        $vehiculoPorVin = Vehiculo::where('vin', $data['vin'])->first();

        if ($iv) {
            if ($vehiculoPorVin && $vehiculoPorVin->id !== $iv->vehiculo_id) {
                $vehiculoPorVin->update($vehiculoData);
                $iv->update(array_merge($ivData, ['vehiculo_id' => $vehiculoPorVin->id]));
                $vehiculo = $vehiculoPorVin;
            } else {
                $vehiculo = Vehiculo::find($iv->vehiculo_id);
                if ($vehiculo) {
                    $vehiculo->fill(array_merge(['vin' => $data['vin']], $vehiculoData))->save();
                } else {
                    $vehiculo = Vehiculo::create(array_merge(['vin' => $data['vin']], $vehiculoData));
                    $iv->update(['vehiculo_id' => $vehiculo->id]);
                }
                $iv->update($ivData);
            }
        } else {
            $vehiculo = $vehiculoPorVin
                ? tap($vehiculoPorVin, fn($v) => $v->update($vehiculoData))
                : Vehiculo::create(array_merge(['vin' => $data['vin']], $vehiculoData));
            IncidenteVehiculo::create(array_merge($ivData, [
                'incidente_id' => $incidente->id,
                'vehiculo_id'  => $vehiculo->id,
            ]));
        }

        return response()->json(['message' => 'Paso 2 guardado correctamente.', 'vehiculo_id' => $vehiculo->id]);
    }

    public function updatePaso3(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $data = $this->lumenValidate($request, [
            'numero_ocupantes'  => 'nullable|integer|min:0',
            'peso_conductor_kg' => 'nullable|numeric|min:0',
            'peso_pasajeros_kg' => 'nullable|numeric|min:0',
            'peso_equipaje_kg'  => 'nullable|numeric|min:0',
        ]);
        $iv = $this->getIncidenteVehiculo($incidente);
        if ($iv) {
            $tara = $iv->vehiculo->peso_tara_kg ?? 0;
            $data['masa_total_kg'] = $tara + ($data['peso_conductor_kg'] ?? 0) + ($data['peso_pasajeros_kg'] ?? 0) + ($data['peso_equipaje_kg'] ?? 0);
            OcupacionCarga::updateOrCreate(['incidente_vehiculo_id' => $iv->id], $data);
        }
        return response()->json(['message' => 'Paso 3 guardado.', 'masa_total_kg' => $data['masa_total_kg'] ?? null]);
    }

    public function updatePaso4(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $data = $this->lumenValidate($request, [
            'calle'                          => 'nullable|string|max:200',
            'municipio'                      => 'nullable|string|max:100',
            'estado_republica'               => 'nullable|string|max:100',
            'km_punto'                       => 'nullable|string|max:50',
            'lat'                            => 'nullable|numeric|between:-90,90',
            'lng'                            => 'nullable|numeric|between:-180,180',
            'velocidad_maxima_permitida_kmh' => 'nullable|numeric|min:0',
            'tipo_via_id'                    => 'nullable|exists:RAT_CAT_TIPO_VIA,id',
            'tipo_trazo_id'                  => 'nullable|exists:RAT_CAT_TIPO_TRAZO,id',
            'condicion_superficie_id'        => 'nullable|exists:RAT_CAT_CONDICION_SUPERFICIE,id',
            'condicion_pavimento_id'         => 'nullable|exists:RAT_CAT_CONDICION_PAVIMENTO,id',
            'tipo_pavimento_id'              => 'nullable|exists:RAT_CAT_TIPO_PAVIMENTO,id',
            'clima_id'                       => 'nullable|exists:RAT_CAT_CLIMA,id',
            'mu_coeficiente_adherencia'      => 'nullable|numeric|between:0,1',
            'orientacion_id'                 => 'nullable|exists:RAT_CAT_ORIENTACION_VIA,id',
            'sentido_vialidad_id'            => 'nullable|exists:RAT_CAT_SENTIDO_VIALIDAD,id',
        ]);
        $ubicacion = UbicacionVia::updateOrCreate(['incidente_id' => $incidente->id], $data);
        return response()->json(['message' => 'Paso 4 guardado.', 'ubicacion_uuid' => $ubicacion->uuid]);
    }

    public function storePaso5(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $iv = $this->getIncidenteVehiculo($incidente);

        if (!$iv) {
            $stubVin      = 'TMP_' . substr(str_replace('-', '', $uuid), 0, 13);
            $stubVehiculo = Vehiculo::where('vin', $stubVin)->first()
                ?? Vehiculo::create([
                    'vin'           => $stubVin,
                    'marca'         => 'Por definir',
                    'anio_modelo'   => (int) date('Y'),
                    'tipo_vehiculo' => 'ligero',
                ]);
            $iv = IncidenteVehiculo::create([
                'incidente_id' => $incidente->id,
                'vehiculo_id'  => $stubVehiculo->id,
                'rol'          => 'A',
            ]);
        }

        $this->lumenValidate($request, [
            'tipo_foto_id' => 'required|exists:RAT_CAT_TIPO_FOTO,id',
            'foto'         => 'required|file|mimes:jpg,jpeg,png,webp|max:10240',
            'descripcion'  => 'nullable|string|max:500',
        ]);
        $path = $request->file('foto')->store("rat/incidentes/{$uuid}/fotos", 'public');
        $foto = Foto::create([
            'incidente_vehiculo_id' => $iv->id,
            'tipo_foto_id'          => $request->tipo_foto_id,
            'url'                   => $path,
            'descripcion'           => $request->descripcion,
        ]);
        return response()->json(['message' => 'Foto guardada.', 'foto_id' => $foto->id, 'url' => $path], 201);
    }

    public function destroyFoto(Request $request, string $uuid, int $fotoId): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $ivIds = IncidenteVehiculo::where('incidente_id', $incidente->id)->pluck('id');
        $foto  = Foto::where('id', $fotoId)->whereIn('incidente_vehiculo_id', $ivIds)->firstOrFail();
        $filePath = storage_path("app/public/{$foto->url}");
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
        $foto->delete();
        return response()->json(['message' => 'Foto eliminada.']);
    }

    public function servirFoto(int $fotoId): \Illuminate\Http\Response
    {
        $foto = Foto::findOrFail($fotoId);
        $path = storage_path("app/public/{$foto->url}");
        if (!file_exists($path)) abort(404);
        $ext  = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $mime = match($ext) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png'         => 'image/png',
            'webp'        => 'image/webp',
            default       => 'application/octet-stream',
        };
        return response(file_get_contents($path), 200)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'private, max-age=3600');
    }

    public function updatePaso6(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $data = $this->lumenValidate($request, [
            'tipo_golpe_id'        => 'required|exists:RAT_CAT_TIPO_GOLPE,id',
            'numero_mediciones_id' => 'required|exists:RAT_CAT_NUMERO_MEDICIONES,id',
            'c1_m'                 => 'required|numeric|min:0',
            'c2_m'                 => 'required|numeric|min:0',
            'c3_m'                 => 'nullable|numeric|min:0',
            'c4_m'                 => 'nullable|numeric|min:0',
            'c5_m'                 => 'nullable|numeric|min:0',
            'c6_m'                 => 'nullable|numeric|min:0',
            'l_ancho_contacto_m'   => 'nullable|numeric|min:0',
            'angulo_fpi_grados'    => 'nullable|numeric|between:-90,90',
            'linea_referencia_mm'  => 'nullable|numeric|min:0',
        ]);
        $iv = $this->getIncidenteVehiculo($incidente);
        if (!$iv) return response()->json(['message' => 'Completa el Paso 2 (Vehículo) antes de guardar la deformación.'], 422);
        $data['c3_m'] = $data['c3_m'] ?? 0;
        DeformacionMedicion::updateOrCreate(
            ['incidente_vehiculo_id' => $iv->id],
            array_merge($data, ['incidente_vehiculo_id' => $iv->id])
        );
        $mediciones = array_filter([$data['c1_m'], $data['c2_m'], $data['c3_m'] ?? null, $data['c4_m'] ?? null, $data['c5_m'] ?? null, $data['c6_m'] ?? null], fn($v) => $v !== null);
        $dmed = count($mediciones) > 0 ? array_sum($mediciones) / count($mediciones) : 0;
        return response()->json(['message' => 'Paso 6 guardado.', 'dmed_calculado_m' => round($dmed, 4)]);
    }

    public function storePaso7(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $data = $this->lumenValidate($request, [
            'a_rigidez_n_m'              => 'nullable|numeric|min:0',
            'b_rigidez_n_m2'             => 'nullable|numeric|min:0',
            'ebs_m_s'                    => 'nullable|numeric|min:0',
            'velocidad_impacto_kmh'      => 'nullable|numeric|min:0',
            'dmed_m'                     => 'nullable|numeric|min:0',
            'velocidad_limpert_kmh'      => 'nullable|numeric|min:0',
            'e_frenado_julios'           => 'nullable|numeric|min:0',
            'velocidad_pre_impacto_kmh'  => 'nullable|numeric|min:0',
            'tiempo_respuesta_frenos_s'  => 'nullable|numeric|min:0',
            'velocidad_final_kmh'        => 'nullable|numeric|min:0',
            'delta_exceso_kmh'           => 'nullable|numeric',
        ]);
        $iv = $this->getIncidenteVehiculo($incidente);
        if (!$iv) return response()->json(['message' => 'Completa el Paso 2 antes.'], 422);
        if (isset($data['velocidad_final_kmh'])) {
            $velMax = optional($incidente->ubicacionVia)->velocidad_maxima_permitida_kmh;
            if ($velMax) {
                $data['exceso_velocidad'] = $data['velocidad_final_kmh'] > $velMax ? 1 : 0;
                $data['delta_exceso_kmh'] = $data['velocidad_final_kmh'] - $velMax;
            }
        }
        $calculo = CalculoVelocidad::updateOrCreate(
            ['incidente_vehiculo_id' => $iv->id],
            array_merge($data, ['incidente_vehiculo_id' => $iv->id])
        );
        return response()->json(['message' => 'Paso 7 guardado.', 'exceso_velocidad' => $calculo->exceso_velocidad]);
    }

    public function updatePaso8(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $data = $this->lumenValidate($request, [
            'narracion_hechos'            => 'nullable|string',
            'objeto_involucrado'          => 'nullable|string|max:200',
            'descripcion_objeto_fijo'     => 'nullable|string',
            'posicion_final_vehiculo'     => 'nullable|string|max:300',
            'direccion_circulacion'       => 'nullable|string|max:200',
            'distancia_ppr_al_pc_m'       => 'nullable|numeric|min:0',
            'tiempo_reaccion_conductor_s' => 'nullable|numeric|min:0',
            'huellas_frenado_m'           => 'nullable|numeric|min:0',
            'huellas_derrape_m'           => 'nullable|numeric|min:0',
        ]);
        $iv = $this->getIncidenteVehiculo($incidente);
        if ($iv) {
            NarrativaDinamica::updateOrCreate(['incidente_vehiculo_id' => $iv->id], $data);
        }
        return response()->json(['message' => 'Paso 8 guardado.']);
    }

    public function updatePaso9(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $data = $this->lumenValidate($request, [
            'principio_intercambio_materiales' => 'nullable|string',
            'principio_correspondencia'        => 'nullable|string',
            'dinamica_colision_fases'          => 'nullable|string',
            'conclusiones_texto'               => 'nullable|string',
            'tipo_documento'                   => 'required|in:informe,dictamen',
            'accion'                           => 'nullable|in:guardar,validar,emitir',
        ]);

        $iv = $this->getIncidenteVehiculo($incidente);

        DB::transaction(function () use ($data, $incidente, $iv) {
            if ($iv) {
                $principios = PrincipiosForenses::updateOrCreate(
                    ['incidente_vehiculo_id' => $iv->id],
                    [
                        'principio_intercambio_materiales' => $data['principio_intercambio_materiales'] ?? null,
                        'principio_correspondencia'        => $data['principio_correspondencia'] ?? null,
                        'dinamica_colision_fases'          => $data['dinamica_colision_fases'] ?? null,
                    ]
                );
                if (!empty($data['conclusiones_texto'])) {
                    Conclusion::where('principios_forenses_id', $principios->id)->delete();
                    $lineas = array_values(array_filter(
                        array_map('trim', explode("\n", $data['conclusiones_texto']))
                    ));
                    foreach ($lineas as $i => $linea) {
                        Conclusion::create([
                            'principios_forenses_id' => $principios->id,
                            'orden'                  => $i + 1,
                            'texto_conclusion'       => $linea,
                        ]);
                    }
                }
            }

            $reporte = Reporte::updateOrCreate(
                ['incidente_id' => $incidente->id],
                [
                    'id_usuario_perito' => $incidente->id_usuario_perito,
                    'tipo_documento'    => $data['tipo_documento'],
                ]
            );

            $accion = $data['accion'] ?? 'guardar';
            if ($accion === 'validar') {
                $incidente->update(['estado' => 1]);
            } elseif ($accion === 'emitir') {
                $incidente->update(['estado' => 2]);
            }
        });

        return response()->json(['message' => 'Paso 9 guardado.', 'estado_incidente' => $incidente->fresh()->estado]);
    }

    private function getIncidenteVehiculo(Incidente $incidente): ?IncidenteVehiculo
    {
        return IncidenteVehiculo::where('incidente_id', $incidente->id)->orderBy('id')->first();
    }
}
