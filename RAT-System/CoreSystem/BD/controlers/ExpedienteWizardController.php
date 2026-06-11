<?php

namespace App\Http\Controllers\Rat;

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
use Illuminate\Support\Str;

/**
 * Controlador del wizard "Nuevo Expediente" (9 pasos).
 *
 * Cada paso tiene su propio método store/update para que el frontend
 * pueda guardar paso a paso sin necesidad de enviar todo de una vez.
 * El uuid del incidente es el hilo conductor entre todos los pasos.
 *
 * Rutas sugeridas:
 *   POST   /api/rat/wizard/paso1-incidente
 *   PUT    /api/rat/wizard/{incidente_uuid}/paso1-incidente
 *   PUT    /api/rat/wizard/{incidente_uuid}/paso2-vehiculo
 *   PUT    /api/rat/wizard/{incidente_uuid}/paso3-ocupantes
 *   PUT    /api/rat/wizard/{incidente_uuid}/paso4-via
 *   POST   /api/rat/wizard/{incidente_uuid}/paso5-evidencia
 *   DELETE /api/rat/wizard/{incidente_uuid}/paso5-evidencia/{foto_id}
 *   PUT    /api/rat/wizard/{incidente_uuid}/paso6-deformacion
 *   POST   /api/rat/wizard/{incidente_uuid}/paso7-calculo
 *   PUT    /api/rat/wizard/{incidente_uuid}/paso8-narrativa
 *   PUT    /api/rat/wizard/{incidente_uuid}/paso9-reporte
 */
class ExpedienteWizardController extends Controller
{
    // =========================================================================
    // PASO 1 — Incidente
    // =========================================================================

    /**
     * POST /api/rat/wizard/paso1-incidente
     * Crea el expediente. Devuelve el uuid para los pasos siguientes.
     */
    public function storePaso1(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numero_siniestro'  => 'required|string|max:100|unique:RAT_INCIDENTE,numero_siniestro',
            'fecha_hecho'       => 'required|date',
            'hora_hecho'        => 'nullable|date_format:H:i',
            'tipo_hecho_id'     => 'required|exists:RAT_CAT_TIPO_HECHO,id',
            'id_usuario_perito' => 'required|exists:sys_users,id_user',
            'estado'            => 'sometimes|integer|in:0,1,2',
        ]);

        $incidente = Incidente::create($data);

        return response()->json([
            'message'         => 'Paso 1 guardado.',
            'incidente_uuid'  => $incidente->uuid,
            'numero_siniestro'=> $incidente->numero_siniestro,
        ], 201);
    }

    /**
     * PUT /api/rat/wizard/{uuid}/paso1-incidente
     * Actualiza el paso 1 si el usuario regresa a editarlo.
     */
    public function updatePaso1(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();

        $data = $request->validate([
            'numero_siniestro'  => 'sometimes|string|max:100|unique:RAT_INCIDENTE,numero_siniestro,'.$incidente->id,
            'fecha_hecho'       => 'sometimes|date',
            'hora_hecho'        => 'nullable|date_format:H:i',
            'tipo_hecho_id'     => 'sometimes|exists:RAT_CAT_TIPO_HECHO,id',
            'id_usuario_perito' => 'sometimes|exists:sys_users,id_user',
            'estado'            => 'sometimes|integer|in:0,1,2',
        ]);

        $incidente->update($data);

        return response()->json(['message' => 'Paso 1 actualizado.', 'data' => $incidente]);
    }

    // =========================================================================
    // PASO 2 — Vehículo
    // =========================================================================

    /**
     * PUT /api/rat/wizard/{uuid}/paso2-vehiculo
     *
     * Si el VIN ya existe en la BD, reutiliza el vehículo (no duplica).
     * Crea o actualiza RAT_INCIDENTE_VEHICULO con los datos del siniestro.
     */
    public function updatePaso2(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();

        $data = $request->validate([
            'vin'                     => 'required|string|size:17',
            'marca'                   => 'required|string|max:100',
            'submarca'                => 'nullable|string|max:100',
            'nombre_modelo'           => 'nullable|string|max:200',
            'anio_modelo'             => 'required|integer|min:1900|max:'.date('Y'),
            'tipo_vehiculo'           => 'required|in:ligero,pesado',
            'tipo_clase'              => 'nullable|string|max:100',
            'peso_tara_kg'            => 'nullable|numeric|min:0',
            'masa_maxima_autorizada_kg'=> 'nullable|numeric|min:0',
            'ancho_mm'                => 'nullable|numeric|min:0',
            'largo_mm'                => 'nullable|numeric|min:0',
            'alto_mm'                 => 'nullable|numeric|min:0',
            'batalla_mm'              => 'nullable|numeric|min:0',
            'voladizo_anterior_mm'    => 'nullable|numeric|min:0',
            'voladizo_posterior_mm'   => 'nullable|numeric|min:0',
            'entrevia_delantera_mm'   => 'nullable|numeric|min:0',
            'entrevia_trasera_mm'     => 'nullable|numeric|min:0',
            'redondez_vertices_mm'    => 'nullable|numeric|min:0',
            'centro_gravedad_m'       => 'nullable|numeric|min:0',
            // Datos del incidente_vehiculo
            'numero_placas'           => 'nullable|string|max:20',
            'color_id'                => 'nullable|exists:RAT_CAT_COLOR,id',
            'estado_neumatico_id'     => 'nullable|exists:RAT_CAT_ESTADO_NEUMATICO,id',
            'rol'                     => 'required|in:A,B,C',
        ]);

        // Reutilizar vehículo si el VIN ya existe
        $vehiculo = Vehiculo::firstOrCreate(
            ['vin' => $data['vin']],
            collect($data)->except(['numero_placas','color_id','estado_neumatico_id','rol'])->toArray()
        );

        // Si ya existía el vehículo, actualizar sus specs (pueden haber cambiado)
        if (!$vehiculo->wasRecentlyCreated) {
            $vehiculo->update(
                collect($data)->except(['vin','numero_placas','color_id','estado_neumatico_id','rol'])->toArray()
            );
        }

        // Crear o actualizar el pivote incidente_vehiculo
        $iv = IncidenteVehiculo::updateOrCreate(
            ['incidente_id' => $incidente->id, 'vehiculo_id' => $vehiculo->id],
            [
                'numero_placas'       => $data['numero_placas'] ?? null,
                'color_id'            => $data['color_id'] ?? null,
                'estado_neumatico_id' => $data['estado_neumatico_id'] ?? null,
                'rol'                 => $data['rol'],
            ]
        );

        return response()->json([
            'message'               => 'Paso 2 guardado.',
            'vehiculo_uuid'         => $vehiculo->uuid,
            'incidente_vehiculo_uuid' => $iv->uuid,
        ]);
    }

    // =========================================================================
    // PASO 3 — Ocupantes / Carga
    // =========================================================================

    /**
     * PUT /api/rat/wizard/{uuid}/paso3-ocupantes
     * Guarda o actualiza RAT_OCUPACION_CARGA.
     * La masa_total_kg se calcula en el backend (tara + conductor + pasajeros + equipaje).
     */
    public function updatePaso3(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);

        $data = $request->validate([
            'numero_ocupantes'  => 'nullable|integer|min:0',
            'peso_conductor_kg' => 'nullable|numeric|min:0',
            'peso_pasajeros_kg' => 'nullable|numeric|min:0',
            'peso_equipaje_kg'  => 'nullable|numeric|min:0',
        ]);

        // Calcular masa total
        $tara = $iv->vehiculo->peso_tara_kg ?? 0;
        $data['masa_total_kg'] = $tara
            + ($data['peso_conductor_kg'] ?? 0)
            + ($data['peso_pasajeros_kg'] ?? 0)
            + ($data['peso_equipaje_kg'] ?? 0);

        OcupacionCarga::updateOrCreate(
            ['incidente_vehiculo_id' => $iv->id],
            $data
        );

        return response()->json([
            'message'       => 'Paso 3 guardado.',
            'masa_total_kg' => $data['masa_total_kg'],
        ]);
    }

    // =========================================================================
    // PASO 4 — Vía
    // =========================================================================

    /**
     * PUT /api/rat/wizard/{uuid}/paso4-via
     * Guarda o actualiza RAT_UBICACION_VIA.
     */
    public function updatePaso4(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();

        $data = $request->validate([
            'calle'                          => 'nullable|string|max:200',
            'numero_exterior'                => 'nullable|string|max:20',
            'colonia'                        => 'nullable|string|max:100',
            'codigo_postal'                  => 'nullable|string|max:10',
            'municipio'                      => 'nullable|string|max:100',
            'estado_republica'               => 'nullable|string|max:100',
            'pais'                           => 'nullable|string|max:100',
            'referencia_adicional'           => 'nullable|string',
            'km_punto'                       => 'nullable|string|max:50',
            'lat'                            => 'nullable|numeric|between:-90,90',
            'lng'                            => 'nullable|numeric|between:-180,180',
            'velocidad_maxima_permitida_kmh' => 'nullable|integer|min:0',
            'tipo_via_id'                    => 'nullable|exists:RAT_CAT_TIPO_VIA,id',
            'tipo_trazo_id'                  => 'nullable|exists:RAT_CAT_TIPO_TRAZO,id',
            'tipo_interseccion_id'           => 'nullable|exists:RAT_CAT_TIPO_INTERSECCION,id',
            'senalamiento_vertical_id'       => 'nullable|exists:RAT_CAT_SENALAMIENTO_VERTICAL,id',
            'senalamiento_horizontal_id'     => 'nullable|exists:RAT_CAT_SENALAMIENTO_HORIZONTAL,id',
            'medidas_via_m'                  => 'nullable|numeric|min:0',
            'orientacion_id'                 => 'nullable|exists:RAT_CAT_ORIENTACION_VIA,id',
            'sentido_vialidad_id'            => 'nullable|exists:RAT_CAT_SENTIDO_VIALIDAD,id',
            'condicion_superficie_id'        => 'nullable|exists:RAT_CAT_CONDICION_SUPERFICIE,id',
            'condicion_pavimento_id'         => 'nullable|exists:RAT_CAT_CONDICION_PAVIMENTO,id',
            'tipo_pavimento_id'              => 'nullable|exists:RAT_CAT_TIPO_PAVIMENTO,id',
            'clima_id'                       => 'nullable|exists:RAT_CAT_CLIMA,id',
            'mu_coeficiente_adherencia'      => 'nullable|numeric|between:0,1',
            'inclinacion_pct'                => 'nullable|numeric',
            'radio_curva_m'                  => 'nullable|numeric|min:0',
            'peraltaje_pct'                  => 'nullable|numeric',
            // Huellas de la escena (array opcional)
            'huellas'                        => 'nullable|array',
            'huellas.*.tipo_indicio_id'      => 'required_with:huellas|exists:RAT_CAT_TIPO_INDICIO,id',
            'huellas.*.longitud_frenado_m'   => 'nullable|numeric|min:0',
            'huellas.*.longitud_derrape_m'   => 'nullable|numeric|min:0',
            'huellas.*.descripcion_indicio'  => 'nullable|string',
        ]);

        // Calcular mu_corregido si tenemos los datos necesarios
        if (isset($data['mu_coeficiente_adherencia'], $data['inclinacion_pct'])) {
            $data['mu_corregido'] = round(
                $data['mu_coeficiente_adherencia'] + ($data['inclinacion_pct'] / 100),
                4
            );
        }

        $ubicacion = UbicacionVia::updateOrCreate(
            ['incidente_id' => $incidente->id],
            collect($data)->except('huellas')->toArray()
        );

        // Sincronizar huellas de la escena
        if (isset($data['huellas'])) {
            HuellaEscena::where('ubicacion_via_id', $ubicacion->id)->delete();
            foreach ($data['huellas'] as $h) {
                HuellaEscena::create(array_merge($h, ['ubicacion_via_id' => $ubicacion->id]));
            }
        }

        return response()->json(['message' => 'Paso 4 guardado.', 'ubicacion_uuid' => $ubicacion->uuid]);
    }

    // =========================================================================
    // PASO 5 — Evidencia fotográfica
    // =========================================================================

    /**
     * POST /api/rat/wizard/{uuid}/paso5-evidencia
     * Sube una foto. Se puede llamar múltiples veces (una por foto).
     * El frontend envía multipart/form-data con el archivo y el tipo.
     *
     * NOTA: El almacenamiento del archivo (S3, disco local, etc.) depende
     * de la configuración del proyecto. Aquí se guarda la URL resultante.
     */
    public function storePaso5(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);

        $request->validate([
            'tipo_foto_id' => 'required|exists:RAT_CAT_TIPO_FOTO,id',
            'foto'         => 'required|file|mimes:jpg,jpeg,png,webp|max:10240',
            'descripcion'  => 'nullable|string|max:500',
            'tomada_en'    => 'nullable|date',
        ]);

        // Almacenar el archivo (ajustar el disco según configuración del proyecto)
        $path = $request->file('foto')->store(
            "rat/incidentes/{$uuid}/fotos",
            'public'
        );

        $foto = Foto::create([
            'incidente_vehiculo_id' => $iv->id,
            'tipo_foto_id'          => $request->tipo_foto_id,
            'url'                   => $path,
            'descripcion'           => $request->descripcion,
            'tomada_en'             => $request->tomada_en,
        ]);

        return response()->json([
            'message'  => 'Foto guardada.',
            'foto_id'  => $foto->id,
            'url'      => $path,
        ], 201);
    }

    /**
     * DELETE /api/rat/wizard/{uuid}/paso5-evidencia/{foto_id}
     * Elimina una foto específica.
     */
    public function destroyFoto(string $uuid, int $fotoId): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);

        $foto = Foto::where('id', $fotoId)
            ->where('incidente_vehiculo_id', $iv->id)
            ->firstOrFail();

        // Eliminar el archivo del disco si existe
        if (\Storage::disk('public')->exists($foto->url)) {
            \Storage::disk('public')->delete($foto->url);
        }

        $foto->delete();

        return response()->json(['message' => 'Foto eliminada.']);
    }

    // =========================================================================
    // PASO 6 — Deformación (mediciones McHenry)
    // =========================================================================

    /**
     * PUT /api/rat/wizard/{uuid}/paso6-deformacion
     * Guarda las mediciones de deformación. La línea de referencia y Dmed
     * se calculan aquí en el backend.
     */
    public function updatePaso6(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);

        $data = $request->validate([
            'tipo_golpe_id'       => 'required|exists:RAT_CAT_TIPO_GOLPE,id',
            'numero_mediciones_id'=> 'required|exists:RAT_CAT_NUMERO_MEDICIONES,id',
            'c1_m'                => 'required|numeric|min:0',
            'c2_m'                => 'required|numeric|min:0',
            'c3_m'                => 'required|numeric|min:0',
            'c4_m'                => 'nullable|numeric|min:0',
            'c5_m'                => 'nullable|numeric|min:0',
            'c6_m'                => 'nullable|numeric|min:0',
            'l_ancho_contacto_m'  => 'nullable|numeric|min:0',
            'angulo_fpi_grados'   => 'nullable|numeric|between:-90,90',
            'arqueamiento_cm'     => 'nullable|numeric|min:0',
        ]);

        // Calcular línea de referencia desde el vehículo (batalla + voladizo anterior)
        $vehiculo = $iv->vehiculo;
        if ($vehiculo && $vehiculo->batalla_mm && $vehiculo->voladizo_anterior_mm) {
            $data['linea_referencia_mm'] = $vehiculo->batalla_mm + $vehiculo->voladizo_anterior_mm;
        }

        DeformacionMedicion::updateOrCreate(
            ['incidente_vehiculo_id' => $iv->id],
            array_merge($data, ['incidente_vehiculo_id' => $iv->id])
        );

        // Calcular Dmed para devolvérselo al frontend (promedio de las mediciones activas)
        $mediciones = array_filter([
            $data['c1_m'], $data['c2_m'], $data['c3_m'],
            $data['c4_m'] ?? null, $data['c5_m'] ?? null, $data['c6_m'] ?? null,
        ], fn($v) => $v !== null);

        $dmed = count($mediciones) > 0 ? array_sum($mediciones) / count($mediciones) : 0;

        return response()->json([
            'message'              => 'Paso 6 guardado.',
            'dmed_calculado_m'     => round($dmed, 4),
            'linea_referencia_mm'  => $data['linea_referencia_mm'] ?? null,
        ]);
    }

    // =========================================================================
    // PASO 7 — Cálculo de velocidad (McHenry)
    // =========================================================================

    /**
     * POST /api/rat/wizard/{uuid}/paso7-calculo
     *
     * El frontend puede enviar los parámetros de entrada y el backend
     * ejecuta el cálculo McHenry completo, o bien el frontend puede enviar
     * los resultados ya calculados (modo "manual"). La pantalla muestra
     * "Resultados calculados - Automático", por lo que se implementa
     * el modo automático cuando se envían los parámetros base.
     */
    public function storePaso7(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);

        $data = $request->validate([
            // Parámetros de entrada (lookup desde tablas técnicas o manuales)
            'categoria_mchenry'         => 'nullable|integer|min:1|max:6',
            'a_rigidez_n_m'             => 'nullable|numeric|min:0',
            'b_rigidez_n_m2'            => 'nullable|numeric|min:0',
            // Vuelco
            'aplica_vuelco'             => 'sometimes|boolean',
            'angulo_vuelco_grados'      => 'nullable|numeric|between:0,90',
            'hipotenusa_vuelco_m'       => 'nullable|numeric|min:0',
            'centro_gravedad_m'         => 'nullable|numeric|min:0',
            // Pre-impacto
            'tiempo_frenos_id'          => 'nullable|exists:RAT_TABLA_TIEMPO_FRENOS,id',
            // Resultados calculados (el frontend puede enviarlos ya calculados)
            'e_deformacion_julios'      => 'nullable|numeric|min:0',
            'e_def_corregida_julios'    => 'nullable|numeric|min:0',
            'h_altura_critica_m'        => 'nullable|numeric|min:0',
            'e_vuelco_julios'           => 'nullable|numeric|min:0',
            'e_total_julios'            => 'nullable|numeric|min:0',
            'ebs_m_s'                   => 'nullable|numeric|min:0',
            'velocidad_impacto_kmh'     => 'nullable|numeric|min:0',
            'dmed_m'                    => 'nullable|numeric|min:0',
            'velocidad_limpert_kmh'     => 'nullable|numeric|min:0',
            'vel_limpert_margenerror_kmh'=> 'nullable|numeric|min:0',
            'e_frenado_julios'          => 'nullable|numeric|min:0',
            'velocidad_pre_impacto_kmh' => 'nullable|numeric|min:0',
            'tiempo_respuesta_frenos_s' => 'nullable|numeric|min:0',
            'velocidad_final_kmh'       => 'nullable|numeric|min:0',
            'delta_exceso_kmh'          => 'nullable|numeric',
            'margen_error_kmh'          => 'nullable|numeric|min:0',
        ]);

        // Determinar exceso de velocidad automáticamente
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

        return response()->json([
            'message'          => 'Paso 7 guardado.',
            'exceso_velocidad' => $calculo->exceso_velocidad,
            'delta_exceso_kmh' => $calculo->delta_exceso_kmh,
        ]);
    }

    // =========================================================================
    // PASO 8 — Narrativa
    // =========================================================================

    /**
     * PUT /api/rat/wizard/{uuid}/paso8-narrativa
     * Guarda la narrativa dinámica y la fase del accidente.
     */
    public function updatePaso8(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);

        $data = $request->validate([
            // Narrativa dinámica
            'narracion_hechos'            => 'nullable|string',
            'objeto_involucrado'          => 'nullable|string|max:200',
            'descripcion_objeto_fijo'     => 'nullable|string',
            'posicion_final_vehiculo'     => 'nullable|string|max:300',
            'direccion_circulacion'       => 'nullable|string|max:200',
            'distancia_ppr_al_pc_m'       => 'nullable|numeric|min:0',
            'tiempo_reaccion_conductor_s' => 'nullable|numeric|min:0',
            'huellas_frenado_m'           => 'nullable|numeric|min:0',
            'huellas_derrape_m'           => 'nullable|numeric|min:0',
            // Fase del accidente
            'posicion_inicial_id'   => 'nullable|exists:RAT_CAT_POSICION_INICIAL,id',
            'percepcion_real_id'    => 'nullable|exists:RAT_CAT_PERCEPCION_REAL,id',
            'factores_percepcion'   => 'nullable|string|max:500',
            'punto_clave_id'        => 'nullable|exists:RAT_CAT_PUNTO_CLAVE,id',
            'factores_punto_clave'  => 'nullable|string|max:500',
            'zona_impacto_id'       => 'nullable|exists:RAT_CAT_ZONA_VEHICULO,id',
            'trayectoria_post_id'   => 'nullable|exists:RAT_CAT_TRAYECTORIA_POST,id',
        ]);

        NarrativaDinamica::updateOrCreate(
            ['incidente_vehiculo_id' => $iv->id],
            collect($data)->only([
                'narracion_hechos', 'objeto_involucrado', 'descripcion_objeto_fijo',
                'posicion_final_vehiculo', 'direccion_circulacion', 'distancia_ppr_al_pc_m',
                'tiempo_reaccion_conductor_s', 'huellas_frenado_m', 'huellas_derrape_m',
            ])->toArray()
        );

        FaseAccidente::updateOrCreate(
            ['incidente_vehiculo_id' => $iv->id],
            collect($data)->only([
                'posicion_inicial_id', 'percepcion_real_id', 'factores_percepcion',
                'punto_clave_id', 'factores_punto_clave', 'zona_impacto_id', 'trayectoria_post_id',
            ])->toArray()
        );

        return response()->json(['message' => 'Paso 8 guardado.']);
    }

    // =========================================================================
    // PASO 9 — Reporte (conclusiones + emitir)
    // =========================================================================

    /**
     * PUT /api/rat/wizard/{uuid}/paso9-reporte
     *
     * Guarda los principios forenses, conclusiones y el reporte.
     * Si se envía accion=validar, cambia estado del incidente a "En revisión".
     * Si se envía accion=emitir, cambia estado a "Finalizado".
     */
    public function updatePaso9(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);

        $data = $request->validate([
            // Principios forenses
            'principio_intercambio_materiales' => 'nullable|string',
            'principio_correspondencia'        => 'nullable|string',
            'dinamica_colision_fases'          => 'nullable|string',
            // Conclusiones (array de textos en orden)
            'conclusiones'                     => 'nullable|array',
            'conclusiones.*.texto_conclusion'  => 'required_with:conclusiones|string',
            'conclusiones.*.validado_perito'   => 'nullable|boolean',
            // Reporte
            'numero_formato'     => 'nullable|string|max:50',
            'tipo_documento'     => 'required|in:informe,dictamen',
            'nivel_emergencia'   => 'nullable|integer|in:1,2,3',
            'fecha_elaboracion'  => 'nullable|date',
            'ubicacion_taller'   => 'nullable|string|max:300',
            // Acción final
            'accion'             => 'nullable|in:guardar,validar,emitir',
        ]);

        DB::transaction(function () use ($data, $incidente, $iv, $request) {
            // Principios forenses
            $principios = PrincipiosForenses::updateOrCreate(
                ['incidente_vehiculo_id' => $iv->id],
                [
                    'principio_intercambio_materiales' => $data['principio_intercambio_materiales'] ?? null,
                    'principio_correspondencia'        => $data['principio_correspondencia'] ?? null,
                    'dinamica_colision_fases'          => $data['dinamica_colision_fases'] ?? null,
                ]
            );

            // Reemplazar conclusiones si vienen en el request
            if (isset($data['conclusiones'])) {
                Conclusion::where('principios_forenses_id', $principios->id)->delete();
                foreach ($data['conclusiones'] as $i => $c) {
                    Conclusion::create([
                        'principios_forenses_id' => $principios->id,
                        'orden'                  => $i + 1,
                        'texto_conclusion'       => $c['texto_conclusion'],
                        'validado_perito'        => $c['validado_perito'] ?? false,
                    ]);
                }
            }

            // Reporte
            $reporte = Reporte::updateOrCreate(
                ['incidente_id' => $incidente->id],
                [
                    'id_usuario_perito'  => $incidente->id_usuario_perito,
                    'numero_formato'     => $data['numero_formato'] ?? null,
                    'tipo_documento'     => $data['tipo_documento'],
                    'nivel_emergencia'   => $data['nivel_emergencia'] ?? null,
                    'fecha_elaboracion'  => $data['fecha_elaboracion'] ?? null,
                    'ubicacion_taller'   => $data['ubicacion_taller'] ?? null,
                ]
            );

            // Cambiar estado según la acción
            $accion = $data['accion'] ?? 'guardar';
            if ($accion === 'validar') {
                $incidente->update(['estado' => 1]);
                $reporte->update(['estado' => 1, 'fecha_inicio' => now()]);
            } elseif ($accion === 'emitir') {
                $incidente->update(['estado' => 2]);
                $reporte->update([
                    'estado'          => 2,
                    'fecha_emision'   => now(),
                    'intentos_emision'=> DB::raw('intentos_emision + 1'),
                ]);
            }
        });

        return response()->json([
            'message'        => 'Paso 9 guardado.',
            'estado_incidente' => $incidente->fresh()->estado,
            'reporte_uuid'   => Reporte::where('incidente_id', $incidente->id)->value('uuid'),
        ]);
    }

    // =========================================================================
    // Helpers privados
    // =========================================================================

    /**
     * Obtiene el IncidenteVehiculo del incidente (asume un vehículo por expediente
     * en el flujo estándar del wizard). Lanza 404 si no existe aún.
     */
    private function getIncidenteVehiculo(Incidente $incidente): IncidenteVehiculo
    {
        return IncidenteVehiculo::where('incidente_id', $incidente->id)
            ->orderBy('id')
            ->firstOrFail();
    }
}
