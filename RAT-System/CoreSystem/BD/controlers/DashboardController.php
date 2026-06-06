<?php

namespace App\Http\Controllers\Rat;

use App\Http\Controllers\Controller;
use App\Models\Rat\Incidente;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/rat/dashboard
     *
     * Devuelve todos los datos que necesita la pantalla Dashboard:
     *  - Contadores por estado
     *  - Expedientes por mes (últimos 6 meses)
     *  - Distribución por tipo de hecho
     *  - Expedientes recientes (últimos 5)
     *  - Resumen del mes actual
     */
    public function index(): JsonResponse
    {
        // ── Contadores por estado ─────────────────────────────────────────────
        $contadores = DB::table('RAT_INCIDENTE')
            ->selectRaw("
                SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) AS casos_abiertos,
                SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS en_revision,
                SUM(CASE WHEN estado = 2 THEN 1 ELSE 0 END) AS finalizados
            ")
            ->first();

        // Excesos de velocidad confirmados
        $excesos = DB::table('RAT_CALCULO_VELOCIDAD')
            ->where('exceso_velocidad', 1)
            ->count();

        // ── Expedientes por mes (últimos 6 meses) ─────────────────────────────
        $expedientesPorMes = DB::table('RAT_INCIDENTE')
            ->selectRaw("DATE_FORMAT(fecha_hecho, '%Y-%m') AS mes, COUNT(*) AS total")
            ->where('fecha_hecho', '>=', now()->subMonths(6)->startOfMonth())
            ->groupByRaw("DATE_FORMAT(fecha_hecho, '%Y-%m')")
            ->orderBy('mes')
            ->get();

        // ── Distribución por tipo de hecho ────────────────────────────────────
        $porTipoHecho = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS t', 'i.tipo_hecho_id', '=', 't.id')
            ->selectRaw('t.nombre, COUNT(*) AS total')
            ->groupBy('t.nombre')
            ->orderByDesc('total')
            ->get();

        // ── Expedientes recientes (últimos 5) ─────────────────────────────────
        $recientes = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS th', 'i.tipo_hecho_id', '=', 'th.id')
            ->leftJoin('RAT_INCIDENTE_VEHICULO AS iv', 'iv.incidente_id', '=', 'i.id')
            ->leftJoin('RAT_VEHICULO AS v', 'iv.vehiculo_id', '=', 'v.id')
            ->leftJoin('RAT_CALCULO_VELOCIDAD AS cv', 'cv.incidente_vehiculo_id', '=', 'iv.id')
            ->select(
                'i.uuid',
                'i.numero_siniestro',
                'i.fecha_hecho',
                'i.hora_hecho',
                'i.estado',
                'th.nombre AS tipo_hecho',
                DB::raw("CONCAT(v.marca, ' ', v.submarca, ' ', v.anio_modelo) AS vehiculo"),
                'cv.velocidad_final_kmh',
                'cv.exceso_velocidad'
            )
            ->orderByDesc('i.created_at')
            ->limit(5)
            ->get();

        // ── Resumen del mes actual ─────────────────────────────────────────────
        $inicioMes = now()->startOfMonth();
        $resumenMes = DB::table('RAT_INCIDENTE AS i')
            ->leftJoin('RAT_INCIDENTE_VEHICULO AS iv', 'iv.incidente_id', '=', 'i.id')
            ->leftJoin('RAT_CALCULO_VELOCIDAD AS cv', 'cv.incidente_vehiculo_id', '=', 'iv.id')
            ->where('i.created_at', '>=', $inicioMes)
            ->selectRaw("
                COUNT(DISTINCT i.id)                                          AS nuevos_casos,
                SUM(CASE WHEN i.estado = 2 THEN 1 ELSE 0 END)                AS cerrados,
                SUM(CASE WHEN cv.exceso_velocidad = 1 THEN 1 ELSE 0 END)     AS con_exceso_velocidad,
                SUM(CASE WHEN i.estado = 1 THEN 1 ELSE 0 END)                AS pendiente_revision
            ")
            ->first();

        return response()->json([
            'contadores' => [
                'casos_abiertos' => (int) $contadores->casos_abiertos,
                'en_revision'    => (int) $contadores->en_revision,
                'finalizados'    => (int) $contadores->finalizados,
                'exceso_velocidad' => $excesos,
            ],
            'expedientes_por_mes' => $expedientesPorMes,
            'por_tipo_hecho'      => $porTipoHecho,
            'expedientes_recientes' => $recientes,
            'resumen_mes'         => $resumenMes,
        ]);
    }
}
