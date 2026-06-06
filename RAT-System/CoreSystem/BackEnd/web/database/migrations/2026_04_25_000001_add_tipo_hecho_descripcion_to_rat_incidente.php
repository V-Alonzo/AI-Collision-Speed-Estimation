<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('RAT_INCIDENTE', function (Blueprint $table) {
            $table->string('tipo_hecho_descripcion', 300)->nullable()
                  ->after('tipo_hecho_id')
                  ->comment('Descripción libre cuando tipo_hecho es "Otro"');
        });
    }

    public function down(): void
    {
        Schema::table('RAT_INCIDENTE', function (Blueprint $table) {
            $table->dropColumn('tipo_hecho_descripcion');
        });
    }
};
