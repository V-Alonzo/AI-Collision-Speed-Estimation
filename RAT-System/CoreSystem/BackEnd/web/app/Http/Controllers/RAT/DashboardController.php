<?php

namespace App\Http\Controllers\RAT;

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
    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $authUser = $request->attributes->get('user');
        $isAdmin  = ($authUser->email ?? '') === 'admin@cesvi.mx';
        $userId   = $authUser->id_user ?? null;

        // ── Contadores por estado ─────────────────────────────────────────────
        $contadores = DB::table('RAT_INCIDENTE')
            ->selectRaw("
                SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) AS casos_abiertos,
                SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS en_revision,
                SUM(CASE WHEN estado = 2 THEN 1 ELSE 0 END) AS finalizados
            ")
            ->when(!$isAdmin && $userId, fn ($q) => $q->where('id_usuario_perito', $userId))
            ->first();

        // Excesos de velocidad (velocidad_pre_impacto > límite permitido, igual que el detalle)
        $excesos = DB::table('RAT_CALCULO_VELOCIDAD AS cv')
            ->join('RAT_INCIDENTE_VEHICULO AS iv', 'iv.id', '=', 'cv.incidente_vehiculo_id')
            ->join('RAT_INCIDENTE AS i', 'i.id', '=', 'iv.incidente_id')
            ->join('RAT_UBICACION_VIA AS uv', 'uv.incidente_id', '=', 'i.id')
            ->whereNotNull('cv.velocidad_pre_impacto_kmh')
            ->whereNotNull('uv.velocidad_maxima_permitida_kmh')
            ->whereColumn('cv.velocidad_pre_impacto_kmh', '>', 'uv.velocidad_maxima_permitida_kmh')
            ->when(!$isAdmin && $userId, fn ($q) => $q->where('i.id_usuario_perito', $userId))
            ->count();

        // ── Expedientes por mes — por fecha del hecho (últimos 12 meses) ────────
        $expedientesPorMes = DB::table('RAT_INCIDENTE')
            ->selectRaw("DATE_FORMAT(fecha_hecho, '%Y-%m') AS mes, COUNT(*) AS total")
            ->where('fecha_hecho', '>=', \Carbon\Carbon::now()->subMonths(12)->startOfMonth())
            ->when(!$isAdmin && $userId, fn ($q) => $q->where('id_usuario_perito', $userId))
            ->groupByRaw("DATE_FORMAT(fecha_hecho, '%Y-%m')")
            ->orderBy('mes')
            ->get();

        // ── Expedientes por mes — por fecha de ingreso (últimos 12 meses) ─────
        $expedientesPorIngreso = DB::table('RAT_INCIDENTE')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS total")
            ->where('created_at', '>=', \Carbon\Carbon::now()->subMonths(12)->startOfMonth())
            ->when(!$isAdmin && $userId, fn ($q) => $q->where('id_usuario_perito', $userId))
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('mes')
            ->get();

        // ── Distribución por tipo de hecho ────────────────────────────────────
        $porTipoHecho = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS t', 'i.tipo_hecho_id', '=', 't.id')
            ->selectRaw('t.nombre, COUNT(*) AS total')
            ->when(!$isAdmin && $userId, fn ($q) => $q->where('i.id_usuario_perito', $userId))
            ->groupBy('t.nombre')
            ->orderByDesc('total')
            ->get();

        // ── Expedientes recientes (últimos 10) ────────────────────────────────
        $recientes = DB::table('RAT_INCIDENTE AS i')
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
                'th.nombre AS tipo_hecho',
                DB::raw("COALESCE(CONCAT(v.marca, ' ', v.submarca, ' ', v.anio_modelo), '—') AS vehiculo"),
                'cv.velocidad_final_kmh',
                DB::raw('CASE WHEN cv.velocidad_pre_impacto_kmh IS NOT NULL AND uv.velocidad_maxima_permitida_kmh IS NOT NULL AND cv.velocidad_pre_impacto_kmh > uv.velocidad_maxima_permitida_kmh THEN 1 ELSE 0 END AS exceso_velocidad'),
                DB::raw('CASE WHEN cv.velocidad_pre_impacto_kmh IS NOT NULL AND uv.velocidad_maxima_permitida_kmh IS NOT NULL AND cv.velocidad_pre_impacto_kmh > uv.velocidad_maxima_permitida_kmh THEN ROUND(cv.velocidad_pre_impacto_kmh - uv.velocidad_maxima_permitida_kmh, 2) ELSE NULL END AS delta_exceso_kmh'),
                'u.name AS perito'
            )
            ->when(!$isAdmin && $userId, fn ($q) => $q->where('i.id_usuario_perito', $userId))
            ->orderByDesc('i.created_at')
            ->limit(10)
            ->get();

        // ── Expedientes con exceso de velocidad ───────────────────────────────
        $conExceso = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS th', 'i.tipo_hecho_id', '=', 'th.id')
            ->join('RAT_INCIDENTE_VEHICULO AS iv', 'iv.incidente_id', '=', 'i.id')
            ->leftJoin('RAT_VEHICULO AS v', 'iv.vehiculo_id', '=', 'v.id')
            ->join('RAT_CALCULO_VELOCIDAD AS cv', 'cv.incidente_vehiculo_id', '=', 'iv.id')
            ->join('RAT_UBICACION_VIA AS uv', 'uv.incidente_id', '=', 'i.id')
            ->leftJoin('sys_users AS u', 'u.id_user', '=', 'i.id_usuario_perito')
            ->whereNotNull('cv.velocidad_pre_impacto_kmh')
            ->whereNotNull('uv.velocidad_maxima_permitida_kmh')
            ->whereColumn('cv.velocidad_pre_impacto_kmh', '>', 'uv.velocidad_maxima_permitida_kmh')
            ->select(
                'i.uuid',
                'i.numero_siniestro',
                'i.fecha_hecho',
                'i.estado',
                'th.nombre AS tipo_hecho',
                DB::raw("COALESCE(CONCAT(v.marca, ' ', v.submarca, ' ', v.anio_modelo), '—') AS vehiculo"),
                'cv.velocidad_final_kmh',
                'cv.velocidad_pre_impacto_kmh',
                'uv.velocidad_maxima_permitida_kmh',
                DB::raw('ROUND(cv.velocidad_pre_impacto_kmh - uv.velocidad_maxima_permitida_kmh, 2) AS delta_exceso_kmh'),
                'u.name AS perito'
            )
            ->when(!$isAdmin && $userId, fn ($q) => $q->where('i.id_usuario_perito', $userId))
            ->orderByDesc('i.fecha_hecho')
            ->get();

        // ── Resumen del mes actual ─────────────────────────────────────────────
        $inicioMes = \Carbon\Carbon::now()->startOfMonth();
        $resumenMes = DB::table('RAT_INCIDENTE AS i')
            ->leftJoin('RAT_INCIDENTE_VEHICULO AS iv', 'iv.incidente_id', '=', 'i.id')
            ->leftJoin('RAT_CALCULO_VELOCIDAD AS cv', 'cv.incidente_vehiculo_id', '=', 'iv.id')
            ->leftJoin('RAT_UBICACION_VIA AS uv', 'uv.incidente_id', '=', 'i.id')
            ->where('i.created_at', '>=', $inicioMes)
            ->when(!$isAdmin && $userId, fn ($q) => $q->where('i.id_usuario_perito', $userId))
            ->selectRaw("
                COUNT(DISTINCT i.id)                                                                                                              AS nuevos_casos,
                SUM(CASE WHEN i.estado = 2 THEN 1 ELSE 0 END)                                                                                    AS cerrados,
                SUM(CASE WHEN cv.velocidad_pre_impacto_kmh IS NOT NULL AND uv.velocidad_maxima_permitida_kmh IS NOT NULL AND cv.velocidad_pre_impacto_kmh > uv.velocidad_maxima_permitida_kmh THEN 1 ELSE 0 END) AS con_exceso_velocidad,
                SUM(CASE WHEN i.estado = 1 THEN 1 ELSE 0 END)                                                                                    AS pendiente_revision
            ")
            ->first();

        return response()->json([
            'contadores' => [
                'casos_abiertos'   => (int) $contadores->casos_abiertos,
                'en_revision'      => (int) $contadores->en_revision,
                'finalizados'      => (int) $contadores->finalizados,
                'exceso_velocidad' => $excesos,
            ],
            'expedientes_por_mes'      => $expedientesPorMes,
            'expedientes_por_ingreso'  => $expedientesPorIngreso,
            'por_tipo_hecho'           => $porTipoHecho,
            'expedientes_recientes'    => $recientes,
            'expedientes_con_exceso'   => $conExceso,
            'resumen_mes'              => $resumenMes,
        ]);
    }
}
