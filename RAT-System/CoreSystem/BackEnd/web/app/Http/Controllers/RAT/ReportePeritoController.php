<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use App\Models\Rat\Incidente; 
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Facades\DB; 

class ReportePeritoController extends Controller
{
    public function generarDocx($uuid)
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();

        $vehiculos = DB::table('RAT_VEHICULO as v')
            ->join('RAT_INCIDENTE_VEHICULO as iv', 'v.id', '=', 'iv.vehiculo_id')
            ->where('iv.incidente_id', $incidente->id)
            ->select('v.marca', 'v.nombre_modelo', 'v.vin', 'v.anio_modelo')
            ->get();

        $phpWord = new PhpWord();
        $section = $phpWord->addSection();

        $section->addTitle("REPORTE TÉCNICO DE ACCIDENTE", 1);
        $section->addText("Expediente: " . $incidente->numero_siniestro);
        $section->addText("Fecha del hecho: " . $incidente->fecha_hecho);
        $section->addTextBreak(1);

        $section->addTitle("2. Vehículos Involucrados", 2);
        
        if ($vehiculos->isEmpty()) {
            $section->addText("No hay vehículos registrados en este expediente.");
        } else {
            foreach ($vehiculos as $v) {
                $infoVehiculo = "- " . ($v->marca ?? 'S/Marca') . " " . ($v->nombre_modelo ?? 'S/Modelo');
                $infoVehiculo .= " (Año: " . ($v->anio_modelo ?? 'N/A') . ")";
                $infoVehiculo .= " [VIN: " . ($v->vin ?? 'Sin VIN') . "]";
                
                $section->addText($infoVehiculo);
            }
        }

        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $fileName = "Reporte_RAT_" . ($incidente->numero_siniestro ?? $uuid) . ".docx";
        $tempFile = tempnam(sys_get_temp_dir(), 'RAT');
        $objWriter->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }
}