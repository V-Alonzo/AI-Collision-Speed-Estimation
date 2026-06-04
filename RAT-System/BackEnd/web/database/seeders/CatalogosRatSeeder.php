<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogosRatSeeder extends Seeder
{
    public function run()
    {
        // Número de Mediciones
        if (DB::table('RAT_CAT_NUMERO_MEDICIONES')->count() === 0) {
            DB::table('RAT_CAT_NUMERO_MEDICIONES')->insert([
                ['id' => 1, 'nombre' => '2'],
                ['id' => 2, 'nombre' => '4'],
                ['id' => 3, 'nombre' => '6'],
            ]);
            $this->command->info('RAT_CAT_NUMERO_MEDICIONES: 3 registros insertados.');
        } else {
            // Actualizar nombres en caso de que estén vacíos
            $vacios = DB::table('RAT_CAT_NUMERO_MEDICIONES')
                ->whereNull('nombre')
                ->orWhere('nombre', '')
                ->count();

            if ($vacios > 0) {
                $existing = DB::table('RAT_CAT_NUMERO_MEDICIONES')->orderBy('id')->get();
                $valores  = ['2', '4', '6'];
                foreach ($existing as $i => $row) {
                    DB::table('RAT_CAT_NUMERO_MEDICIONES')
                        ->where('id', $row->id)
                        ->update(['nombre' => $valores[$i] ?? (string)(($i + 1) * 2)]);
                }
                $this->command->info("RAT_CAT_NUMERO_MEDICIONES: {$vacios} nombres corregidos.");
            } else {
                $this->command->info('RAT_CAT_NUMERO_MEDICIONES: ya tiene datos correctos.');
            }
        }
    }
}
