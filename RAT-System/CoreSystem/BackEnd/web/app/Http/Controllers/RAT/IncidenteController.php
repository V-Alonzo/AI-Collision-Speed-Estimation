<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use App\Models\Rat\Incidente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class IncidenteController extends Controller
{
    private function getJwtUser(Request $request)
    {
        return $request->attributes->get('user');
    }

    private function isAdmin(Request $request): bool
    {
        return ($this->getJwtUser($request)->email ?? '') === 'admin@cesvi.mx';
    }

    private function checkOwnership(Request $request, Incidente $incidente): void
    {
        if ($this->isAdmin($request)) return;

        $user = $this->getJwtUser($request);
        if ($incidente->id_usuario_perito != ($user->id_user ?? null)) {
            abort(403, 'No tienes permiso para acceder a este expediente.');
        }
    }

    /**
     * GET /v1/rat/incidentes
     *
     * Lista paginada con filtros. Usuarios normales solo ven sus propios expedientes;
     * el admin ve todos.
     */
    public function index(Request $request): JsonResponse
    {
        $user    = $this->getJwtUser($request);
        $isAdmin = ($user->email ?? '') === 'admin@cesvi.mx';

        $query = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS th', 'i.tipo_hecho_id', '=', 'th.id')
            ->leftJoin('RAT_INCIDENTE_VEHICULO AS iv', 'iv.incidente_id', '=', 'i.id')
            ->leftJoin('RAT_VEHICULO AS v', 'iv.vehiculo_id', '=', 'v.id')
            ->leftJoin('RAT_CALCULO_VELOCIDAD AS cv', 'cv.incidente_vehiculo_id', '=', 'iv.id')
            ->leftJoin('RAT_UBICACION_VIA AS uv', 'uv.incidente_id', '=', 'i.id')
            ->leftJoin('sys_users AS u', 'u.id_user', '=', 'i.id_usuario_perito')
            ->select(
                'i.uuid',
                'i.numero_siniestro',
                'i.fecha_hecho',
                'i.hora_hecho',
                'i.estado',
                'i.created_at',
                'th.nombre AS tipo_hecho',
                DB::raw("CONCAT(v.marca, ' ', COALESCE(v.submarca,''), ' ', v.anio_modelo) AS vehiculo"),
                DB::raw("CONCAT(u.name) AS perito"),
                'cv.velocidad_final_kmh',
                'cv.velocidad_pre_impacto_kmh',
                'uv.velocidad_maxima_permitida_kmh',
                DB::raw('CASE WHEN cv.velocidad_pre_impacto_kmh IS NOT NULL AND uv.velocidad_maxima_permitida_kmh IS NOT NULL AND cv.velocidad_pre_impacto_kmh > uv.velocidad_maxima_permitida_kmh THEN 1 ELSE 0 END AS exceso_velocidad'),
                DB::raw('CASE WHEN cv.velocidad_pre_impacto_kmh IS NOT NULL AND uv.velocidad_maxima_permitida_kmh IS NOT NULL AND cv.velocidad_pre_impacto_kmh > uv.velocidad_maxima_permitida_kmh THEN ROUND(cv.velocidad_pre_impacto_kmh - uv.velocidad_maxima_permitida_kmh, 2) ELSE NULL END AS delta_exceso_kmh')
            );

        // Usuarios normales solo ven sus propios expedientes
        if (!$isAdmin) {
            $query->where('i.id_usuario_perito', $user->id_user);
        }

        if ($buscar = $request->input('buscar')) {
            $query->where('i.numero_siniestro', 'like', "%{$buscar}%");
        }

        if ($desde = $request->input('desde')) {
            $query->where('i.fecha_hecho', '>=', $desde);
        }
        if ($hasta = $request->input('hasta')) {
            $query->where('i.fecha_hecho', '<=', $hasta);
        }

        if ($tipoHecho = $request->input('tipo_hecho_id')) {
            $query->where('i.tipo_hecho_id', $tipoHecho);
        }

        if ($request->filled('estado')) {
            $query->where('i.estado', $request->input('estado'));
        }

        // Solo el admin puede filtrar por perito específico
        if ($isAdmin && ($peritoId = $request->input('perito_id'))) {
            $query->where('i.id_usuario_perito', $peritoId);
        }

        $perPage = $request->input('per_page', 10);
        $data    = $query->orderByDesc('i.fecha_hecho')->paginate($perPage);

        return response()->json([
            'data'  => $data->items(),
            'meta'  => [
                'total'        => $data->total(),
                'per_page'     => $data->perPage(),
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
            ],
        ]);
    }

    /**
     * GET /v1/rat/incidentes/{uuid}
     *
     * Detalle completo. Solo el propietario o el admin pueden acceder.
     */
    public function show(Request $request, $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        $incidente->load([
            'tipoHecho',
            'perito',
            'ubicacionVia.tipoVia',
            'ubicacionVia.tipoTrazo',
            'ubicacionVia.clima',
            'ubicacionVia.tipoPavimento',
            'ubicacionVia.condicionSuperficie',
            'ubicacionVia.condicionPavimento',
            'ubicacionVia.orientacion',
            'ubicacionVia.sentidoVialidad',
            'vehiculos.vehiculo',
            'vehiculos.color',
            'vehiculos.estadoNeumatico',
            'vehiculos.ocupacionCarga',
            'vehiculos.deformacionMedicion.tipoGolpe',
            'vehiculos.calculoVelocidad',
            'vehiculos.narrativaDinamica',
            'vehiculos.principiosForenses.conclusiones',
            'vehiculos.fotos.tipoFoto',
            'reportes',
        ]);

        return response()->json($incidente);
    }

    /**
     * DELETE /v1/rat/incidentes/{uuid}
     *
     * Solo el propietario o el admin pueden eliminar.
     */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);

        DB::transaction(function () use ($incidente) {
            $id = $incidente->id;

            $ivIds = DB::table('RAT_INCIDENTE_VEHICULO')
                ->where('incidente_id', $id)->pluck('id');

            if ($ivIds->isNotEmpty()) {
                $pfIds = DB::table('RAT_PRINCIPIOS_FORENSES')
                    ->whereIn('incidente_vehiculo_id', $ivIds)->pluck('id');
                if ($pfIds->isNotEmpty()) {
                    DB::table('RAT_CONCLUSION')
                        ->whereIn('principios_forenses_id', $pfIds)->delete();
                }

                foreach ([
                    'RAT_PRINCIPIOS_FORENSES', 'RAT_NARRATIVA_DINAMICA',
                    'RAT_CALCULO_VELOCIDAD',   'RAT_DEFORMACION_MEDICION',
                    'RAT_FASE_ACCIDENTE',      'RAT_OCUPACION_CARGA',
                    'RAT_FOTO',                'RAT_MODALIDAD_DANO',
                    'RAT_IA_SOLICITUD',
                ] as $tabla) {
                    DB::table($tabla)->whereIn('incidente_vehiculo_id', $ivIds)->delete();
                }

                DB::table('RAT_INCIDENTE_VEHICULO')->where('incidente_id', $id)->delete();
            }

            $uvIds = DB::table('RAT_UBICACION_VIA')
                ->where('incidente_id', $id)->pluck('id');
            if ($uvIds->isNotEmpty()) {
                DB::table('RAT_HUELLA_ESCENA')
                    ->whereIn('ubicacion_via_id', $uvIds)->delete();
            }

            DB::table('RAT_IA_SOLICITUD')->where('incidente_id', $id)->delete();
            DB::table('RAT_UBICACION_VIA')->where('incidente_id', $id)->delete();
            DB::table('RAT_REPORTE')->where('incidente_id', $id)->delete();

            $incidente->delete();
        });

        return response()->json(['message' => 'Expediente eliminado.'], 200);
    }

    /**
     * PATCH /v1/rat/incidentes/{uuid}/estado
     *
     * Solo el propietario o el admin pueden cambiar el estado.
     */
    public function cambiarEstado(Request $request, string $uuid): JsonResponse
    {
        $this->validate($request, [
            'estado' => ['required', Rule::in([0, 1, 2, 3])],
        ]);

        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $this->checkOwnership($request, $incidente);
        $incidente->update(['estado' => $request->estado]);

        return response()->json([
            'message' => 'Estado actualizado.',
            'estado'  => $incidente->estado,
        ]);
    }
}
