<?php

namespace App\Http\Controllers\RAT;

use App\Models\EvidenciaFoto;
use App\Models\Siniestro;
use Illuminate\Http\Request;

class EvidenciaController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // GET - Listar fotos por siniestro
    public function listaBySiniestro($siniestro_id)
    {
        $siniestro = Siniestro::findOrFail($siniestro_id);
        $fotos = EvidenciaFoto::where('siniestro_id', $siniestro_id)
            ->with('iaResultados')
            ->orderBy('orden_captura')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $fotos
        ]);
    }

    // GET - Detalle de una foto
    public function show($id)
    {
        $foto = EvidenciaFoto::with('siniestro', 'iaResultados')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $foto
        ]);
    }

    // POST - Crear/subir foto
    public function store(Request $request)
    {
        $validated = $request->validate([
            'siniestro_id' => 'required|exists:siniestros,id',
            'nombre_archivo' => 'required|string',
            'nombre_original' => 'required|string',
            'url_s3' => 'required|url',
            'parte_equipo' => 'required|string',
            'fecha_captura' => 'required|date',
            'tipo_equipo' => 'required|in:ligero,pesado',
            'descripcion' => 'required|string',
            'mime_type' => 'required|string',
            'tamaño_bytes' => 'required|integer'
        ]);

        $foto = EvidenciaFoto::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Foto registrada exitosamente',
            'data' => $foto
        ], 201);
    }

    // PUT - Actualizar foto
    public function update(Request $request, $id)
    {
        $foto = EvidenciaFoto::findOrFail($id);

        $validated = $request->validate([
            'parte_equipo' => 'string',
            'descripcion' => 'string',
            'estado_procesamiento' => 'in:pendiente,enviada_ia,procesando,completada,rechazada,error'
        ]);

        $foto->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Foto actualizada exitosamente',
            'data' => $foto
        ]);
    }

    // DELETE - Eliminar foto
    public function destroy($id)
    {
        $foto = EvidenciaFoto::findOrFail($id);
        $foto->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto eliminada exitosamente'
        ]);
    }
}
