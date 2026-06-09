<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidencia_fotos', function (Blueprint $table) {
            $table->id();
            
            // Relación con siniestro
            $table->foreignId('siniestro_id')->constrained('siniestros')->cascadeOnDelete();
            
            // Información del archivo
            $table->string('nombre_archivo', 255);
            $table->string('nombre_original', 255);
            $table->string('url_s3')->unique()->index();
            $table->string('path_local')->nullable();
            $table->string('mime_type', 50);
            $table->bigInteger('tamaño_bytes');
            
            // Resolución de imagen
            $table->integer('resolucion_ancho')->nullable();
            $table->integer('resolucion_alto')->nullable();
            $table->decimal('megapixeles', 6, 2)->nullable();
            
            // Metadatos EXIF
            $table->json('exif_data')->nullable();
            $table->dateTime('fecha_foto_original')->nullable();
            
            // Clasificación según catálogo CESVI
            $table->enum('tipo_equipo', [
                'ligero',
                'pesado'
            ])->index();
            
            $table->enum('parte_equipo', [
                'parachoque_frontal',
                'parachoque_trasero',
                'cofre',
                'puerta_frontal_derecha',
                'puerta_frontal_izquierda',
                'puerta_trasera_derecha',
                'puerta_trasera_izquierda',
                'vidrio_frontal',
                'vidrio_trasero',
                'vidrio_lateral',
                'espejo_lateral',
                'llanta_frontal_derecha',
                'llanta_frontal_izquierda',
                'llanta_trasera_derecha',
                'llanta_trasera_izquierda',
                'bastidor',
                'chasis',
                'estructura_carrocería',
                'motor',
                'interior',
                'general',
                'detalle_dano',
                'otro'
            ])->index();
            
            // Información de captura
            $table->text('descripcion');
            $table->integer('orden_captura')->default(0);
            $table->dateTime('fecha_captura');
            $table->string('dispositivo_captura', 100)->nullable();
            $table->string('coordenadas_gps', 100)->nullable();
            
            // Validación de calidad
            $table->boolean('es_alta_resolucion')->default(false);
            $table->boolean('tiene_marca_agua')->default(false);
            $table->decimal('score_calidad', 3, 2)->nullable();
            $table->text('problemas_detectados')->nullable();
            
            // Estado del procesamiento
            $table->enum('estado_procesamiento', [
                'pendiente',
                'enviada_ia',
                'procesando',
                'completada',
                'rechazada',
                'error'
            ])->default('pendiente')->index();
            
            // Información de procesamiento IA
            $table->string('id_tarea_ia')->nullable()->unique();
            $table->dateTime('fecha_envio_ia')->nullable();
            $table->dateTime('fecha_completado_ia')->nullable();
            $table->integer('tiempo_procesamiento_seg')->nullable();
            $table->text('mensaje_error_ia')->nullable();
            
            // Auditoría
            $table->string('uploaded_by', 150);
            $table->string('validated_by', 150)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evidencia_fotos');
    }
};
