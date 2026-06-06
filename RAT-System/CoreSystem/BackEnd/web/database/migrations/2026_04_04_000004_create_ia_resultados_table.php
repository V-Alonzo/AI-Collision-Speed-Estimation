<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ia_resultados', function (Blueprint $table) {
            $table->id();
            
            // Relaciones
            $table->foreignId('siniestro_id')->constrained('siniestros')->cascadeOnDelete();
            $table->foreignId('evidencia_foto_id')->nullable()->constrained('evidencia_fotos')->nullOnDelete();
            
            // Identificación
            $table->string('id_procesamiento_ia')->unique()->nullable()->index();
            $table->dateTime('fecha_procesamiento_ia')->index();
            
            // Método de cálculo
            $table->enum('metodo_calculo', [
                'McHenry',
                'Campbell',
                'CRASH',
                'Multiphase',
                'Energy_Method',
                'otro'
            ])->index();
            
            // RESULTADOS: VELOCIDAD
            $table->decimal('velocidad_calculada_kmh', 8, 2)->nullable();
            $table->decimal('velocidad_minima_kmh', 8, 2)->nullable();
            $table->decimal('velocidad_maxima_kmh', 8, 2)->nullable();
            $table->decimal('margen_error_porcentaje', 5, 2)->default(5.0);
            $table->text('observaciones_velocidad')->nullable();
            
            // ANÁLISIS: DEFORMACIÓN
            $table->json('areas_danadas')->nullable();
            $table->json('severidad_dano')->nullable();
            $table->decimal('profundidad_deformacion_cm', 8, 2)->nullable();
            $table->decimal('ancho_deformacion_cm', 8, 2)->nullable();
            $table->decimal('largo_deformacion_cm', 8, 2)->nullable();
            $table->text('observaciones_deformacion')->nullable();
            
            // ANÁLISIS: ENERGÍA
            $table->decimal('energia_aproximada_joules', 15, 2)->nullable();
            $table->decimal('factor_rigidez', 8, 4)->nullable();
            $table->text('observaciones_energia')->nullable();
            
            // CONFIABILIDAD
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->enum('nivel_confianza', [
                'muy_bajo',
                'bajo',
                'medio',
                'alto',
                'muy_alto'
            ])->nullable();
            
            // PARÁMETROS
            $table->json('parametros_modelo')->nullable();
            $table->json('parametros_entrada')->nullable();
            $table->text('observaciones_ia')->nullable();
            $table->text('limitaciones_modelo')->nullable();
            
            // VALIDACIÓN PERITO
            $table->boolean('validado_por_perito')->default(false)->index();
            $table->string('perito_validador', 150)->nullable();
            $table->dateTime('fecha_validacion_perito')->nullable();
            $table->text('comentarios_perito')->nullable();
            $table->enum('estado_validacion', [
                'pendiente',
                'aprobado',
                'rechazado',
                'requiere_ajuste'
            ])->default('pendiente')->index();
            
            // INFORMACIÓN RESPUESTA
            $table->integer('tiempo_procesamiento_seg')->nullable();
            $table->json('metadata_respuesta')->nullable();
            $table->text('mensaje_respuesta')->nullable();
            $table->text('errores_reportados')->nullable();
            
            // AUDITORÍA
            $table->string('created_by', 150);
            $table->string('updated_by', 150)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ia_resultados');
    }
};
