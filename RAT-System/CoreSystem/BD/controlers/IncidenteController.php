<?php

namespace App\Http\Controllers\Rat;

use App\Http\Controllers\Controller;
use App\Models\Rat\Incidente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class IncidenteController extends Controller
{
    /**
     * GET /api/rat/incidentes
     *
     * Lista paginada con filtros. Alimenta la pantalla "Expedientes RAT".
     * Filtros disponibles: buscar (texto), desde, hasta, tipo_hecho, estado, perito_id
     */
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS th', 'i.tipo_hecho_id', '=', 'th.id')
            ->leftJoin('RAT_INCIDENTE_VEHICULO AS iv', 'iv.incidente_id', '=', 'i.id')
            ->leftJoin('RAT_VEHICULO AS v', 'iv.vehiculo_id', '=', 'v.id')
            ->leftJoin('RAT_CALCULO_VELOCIDAD AS cv', 'cv.incidente_vehiculo_id', '=', 'iv.id')
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
                'cv.exceso_velocidad',
                'cv.delta_exceso_kmh'
            );

        // Búsqueda por número de siniestro
        if ($buscar = $request->input('buscar')) {
            $query->where('i.numero_siniestro', 'like', "%{$buscar}%");
        }

        // Filtro por rango de fechas
        if ($desde = $request->input('desde')) {
            $query->where('i.fecha_hecho', '>=', $desde);
        }
        if ($hasta = $request->input('hasta')) {
            $query->where('i.fecha_hecho', '<=', $hasta);
        }

        // Filtro por tipo de hecho
        if ($tipoHecho = $request->input('tipo_hecho_id')) {
            $query->where('i.tipo_hecho_id', $tipoHecho);
        }

        // Filtro por estado (0=Abierto, 1=En revisión, 2=Finalizado)
        if ($request->filled('estado')) {
            $query->where('i.estado', $request->input('estado'));
        }

        // Filtro por perito
        if ($peritoId = $request->input('perito_id')) {
            $query->where('i.id_usuario_perito', $peritoId);
        }

        $total = $query->count();
        $perPage = $request->input('per_page', 10);
        $data = $query->orderByDesc('i.fecha_hecho')->paginate($perPage);

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
     * GET /api/rat/incidentes/{uuid}
     *
     * Detalle completo de un expediente. Carga todas las secciones
     * del wizard para permitir ver / editar el expediente.
     */
    public function show(string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)
            ->with([
                'tipoHecho',
                'ubicacionVia.tipoVia',
                'ubicacionVia.tipoTrazo',
                'ubicacionVia.condicionSuperficie',
                'ubicacionVia.tipoPavimento',
                'ubicacionVia.clima',
                'ubicacionVia.huellas.tipoIndicio',
                'vehiculos.vehiculo',
                'vehiculos.color',
                'vehiculos.estadoNeumatico',
                'vehiculos.ocupacionCarga',
                'vehiculos.fotos.tipoFoto',
                'vehiculos.deformacionMedicion.tipoGolpe',
                'vehiculos.calculoVelocidad',
                'vehiculos.faseAccidente',
                'vehiculos.narrativaDinamica',
                'vehiculos.principiosForenses.conclusiones',
                'reportes',
            ])
            ->firstOrFail();

        return response()->json($incidente);
    }

    /**
     * PATCH /api/rat/incidentes/{uuid}/estado
     *
     * Cambia el estado del expediente (0=Abierto, 1=En revisión, 2=Finalizado).
     * Usado desde la lista de expedientes y desde el paso 9 (Reporte).
     */
    public function cambiarEstado(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'estado' => ['required', Rule::in([0, 1, 2])],
        ]);

        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $incidente->update(['estado' => $request->input('estado')]);

        return response()->json([
            'message' => 'Estado actualizado.',
            'estado'  => $incidente->estado,
        ]);
    }

    /**
     * DELETE /api/rat/incidentes/{uuid}
     *
     * Elimina un expediente completo. Solo disponible cuando estado = 0 (Abierto).
     * Los registros hijos se eliminan por CASCADE en la BD.
     */
    public function destroy(string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();

        if ($incidente->estado !== 0) {
            return response()->json([
                'message' => 'Solo se pueden eliminar expedientes en estado Abierto.',
            ], 422);
        }

        $incidente->delete();

        return response()->json(['message' => 'Expediente eliminado.'], 200);
    }
}
