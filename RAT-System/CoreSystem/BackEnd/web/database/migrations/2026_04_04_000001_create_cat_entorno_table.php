<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cat_entorno', function (Blueprint $table) {
            $table->id();
            
            // Condiciones climáticas
            $table->enum('clima', [
                'soleado',
                'nublado',
                'lluvia_ligera',
                'lluvia_fuerte',
                'niebla',
                'granizo',
                'nieve',
                'otro'
            ])->nullable()->index();
            
            // Tipo de vía
            $table->enum('tipo_via', [
                'autopista',
                'carretera_federal',
                'carretera_estatal',
                'avenida',
                'calle',
                'callejón',
                'otro'
            ])->nullable()->index();
            
            // Superficie
            $table->enum('superficie', [
                'asfalto',
                'concreto',
                'terracería',
                'grava',
                'adoquín',
                'otro'
            ])->nullable()->index();
            
            // Condición de la superficie
            $table->enum('condicion_superficie', [
                'seca',
                'mojada',
                'con_baches',
                'dañada',
                'deformada',
                'otro'
            ])->nullable()->index();
            
            // Características viales
            $table->integer('numero_carriles')->nullable();
            $table->boolean('tiene_divisor')->default(false);
            $table->boolean('tiene_banqueta')->default(false);
            $table->decimal('ancho_carril', 5, 2)->nullable();
            
            // Visibilidad
            $table->enum('visibilidad', [
                'excelente',
                'buena',
                'regular',
                'mala',
                'muy_mala'
            ])->default('buena')->nullable();
            
            // Iluminación
            $table->enum('iluminacion', [
                'diurna',
                'nocturna_iluminada',
                'nocturna_sin_iluminar',
                'atardecer'
            ])->nullable()->index();
            
            // Observaciones
            $table->text('observaciones')->nullable();
            $table->text('caracteristicas_adicionales')->nullable();
            
            // Auditoría
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cat_entorno');
    }
};
