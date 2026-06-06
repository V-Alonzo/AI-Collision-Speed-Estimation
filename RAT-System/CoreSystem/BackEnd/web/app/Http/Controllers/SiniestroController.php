<?php

namespace App\Http\Controllers;

use App\Models\Siniestro;
use Illuminate\Http\Request;

class SiniestroController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // GET - Listar todos los siniestros
    public function index()
    {
        $siniestros = Siniestro::with('catEntorno', 'evidenciaFotos', 'iaResultados')
            ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $siniestros
        ]);
    }

    // GET - Detalle de un siniestro
    public function show($id)
    {
        $siniestro = Siniestro::with('catEntorno', 'evidenciaFotos', 'iaResultados')
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $siniestro
        ]);
    }

    // POST - Crear siniestro
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_siniestro' => 'required|unique:siniestros',
            'fecha_hora_siniestro' => 'required|date',
            'tipo_accidente' => 'required|in:colisión_frontal,colisión_trasera,colisión_lateral,colisión_múltiple,volcadura,caída_acantilado,choque_objeto_fijo,salida_carretera,atropellamiento,otro',
            'ubicacion_calle' => 'required|string',
            'ubicacion_ciudad' => 'required|string',
            'ubicacion_estado' => 'required|string',
            'ubicacion_cp' => 'required|string',
            'ubicacion_lat' => 'nullable|numeric',
            'ubicacion_lng' => 'nullable|numeric',
            'descripcion_detallada' => 'required|string',
            'perito_nombre' => 'required|string',
            'perito_cedula' => 'required|string',
            'perito_email' => 'required|email',
            'cat_entorno_id' => 'nullable|exists:cat_entorno,id'
        ]);

        $siniestro = Siniestro::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Siniestro creado exitosamente',
            'data' => $siniestro
        ], 201);
    }

    // PUT - Actualizar siniestro
    public function update(Request $request, $id)
    {
        $siniestro = Siniestro::findOrFail($id);

        $validated = $request->validate([
            'numero_siniestro' => 'required|unique:siniestros,numero_siniestro,' . $id,
            'fecha_hora_siniestro' => 'required|date',
            'tipo_accidente' => 'required|in:colisión_frontal,colisión_trasera,colisión_lateral,colisión_múltiple,volcadura,caída_acantilado,choque_objeto_fijo,salida_carretera,atropellamiento,otro',
            'ubicacion_calle' => 'required|string',
            'ubicacion_ciudad' => 'required|string',
            'ubicacion_estado' => 'required|string',
            'ubicacion_cp' => 'required|string',
            'ubicacion_lat' => 'nullable|numeric',
            'ubicacion_lng' => 'nullable|numeric',
            'descripcion_detallada' => 'required|string',
            'perito_nombre' => 'required|string',
            'perito_cedula' => 'required|string',
            'perito_email' => 'required|email',
            'cat_entorno_id' => 'nullable|exists:cat_entorno,id',
            'estado' => 'in:captura_inicial,analisis_danos,dinamica_colision,conclusiones,reporte_final,completado,en_revision,rechazado',
            'porcentaje_avance' => 'nullable|integer|min:0|max:100'
        ]);

        $siniestro->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Siniestro actualizado exitosamente',
            'data' => $siniestro
        ]);
    }

    // DELETE - Eliminar siniestro
    public function destroy($id)
    {
        $siniestro = Siniestro::findOrFail($id);
        $siniestro->delete();

        return response()->json([
            'success' => true,
            'message' => 'Siniestro eliminado exitosamente'
        ]);
    }

    // PATCH - Cambiar estado
    public function cambiarEstado(Request $request, $id)
    {
        $siniestro = Siniestro::findOrFail($id);

        $validated = $request->validate([
            'estado' => 'required|in:captura_inicial,analisis_danos,dinamica_colision,conclusiones,reporte_final,completado,en_revision,rechazado'
        ]);

        $siniestro->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado',
            'data' => $siniestro
        ]);
    }
}
