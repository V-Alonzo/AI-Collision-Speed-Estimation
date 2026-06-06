<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siniestros', function (Blueprint $table) {
            $table->id();
            
            // Identificación
            $table->string('numero_siniestro')->unique()->index();
            $table->string('folio_cesvi')->unique()->nullable()->index();
            
            // Fecha y hora
            $table->dateTime('fecha_hora_siniestro')->index();
            $table->dateTime('fecha_levantamiento')->index();
            $table->dateTime('fecha_cierre')->nullable();
            
            // Ubicación
            $table->string('ubicacion_calle', 255);
            $table->string('ubicacion_numero', 50)->nullable();
            $table->string('ubicacion_interior', 50)->nullable();
            $table->string('ubicacion_colonia', 150);
            $table->string('ubicacion_ciudad', 150)->index();
            $table->string('ubicacion_estado', 100)->index();
            $table->string('ubicacion_cp', 10);
            $table->string('ubicacion_pais', 100)->default('México');
            
            // Coordenadas GPS
            $table->decimal('ubicacion_lat', 10, 8)->nullable();
            $table->decimal('ubicacion_lng', 10, 8)->nullable();
            
            // Tipo de accidente
            $table->enum('tipo_accidente', [
                'colisión_frontal',
                'colisión_trasera',
                'colisión_lateral',
                'colisión_múltiple',
                'volcadura',
                'caída_acantilado',
                'choque_objeto_fijo',
                'salida_carretera',
                'atropellamiento',
                'otro'
            ])->index();
            
            // Descripción detallada
            $table->text('descripcion_detallada');
            $table->text('circunstancias')->nullable();
            
            // Relación con catálogo
            $table->foreignId('cat_entorno_id')->nullable()->constrained('cat_entorno')->nullOnDelete();
            
            // Información del perito
            $table->string('perito_nombre', 255);
            $table->string('perito_cedula', 50)->index();
            $table->string('perito_email', 150);
            $table->string('perito_telefono', 20)->nullable();
            $table->string('perito_empresa', 150)->nullable();
            
            // Información de compañía aseguradora
            $table->string('aseguradora_nombre', 150)->nullable();
            $table->string('aseguradora_póliza', 100)->nullable();
            $table->string('aseguradora_ajustador', 150)->nullable();
            
            // Estado del proceso RAT
            $table->enum('estado', [
                'captura_inicial',
                'analisis_danos',
                'dinamica_colision',
                'conclusiones',
                'reporte_final',
                'completado',
                'en_revision',
                'rechazado'
            ])->default('captura_inicial')->index();
            
            // Progreso
            $table->integer('porcentaje_avance')->default(0);
            $table->integer('total_fotos')->default(0);
            $table->integer('fotos_procesadas')->default(0);
            
            // Notas internas
            $table->text('notas_internas')->nullable();
            $table->text('recomendaciones')->nullable();
            
            // Auditoría
            $table->string('created_by', 150)->nullable();
            $table->string('updated_by', 150)->nullable();
            $table->string('status', 50)->default('activo')->index();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siniestros');
    }
};
