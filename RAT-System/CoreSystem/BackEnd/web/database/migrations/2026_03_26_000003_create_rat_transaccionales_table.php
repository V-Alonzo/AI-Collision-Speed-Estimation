<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── RAT_INCIDENTE ─────────────────────────────────────────────────────
        // uuid: clave publica expuesta en URLs/API.
        // id:   clave interna usada en JOINs con tablas hijas.
        Schema::create('RAT_INCIDENTE', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique()->comment('UUID publico - usar en URLs y API');
            $table->string('numero_siniestro', 100)->unique()->comment('Ej: RAT-2026-024');
            $table->date('fecha_hecho');
            $table->time('hora_hecho')->nullable();
            $table->unsignedInteger('tipo_hecho_id')->comment('FK → RAT_CAT_TIPO_HECHO.id');
            $table->unsignedBigInteger('id_usuario_perito')->comment('FK → sys_users.id_user');
            $table->tinyInteger('estado')->default(0)
                  ->comment('0=Abierto / 1=En revision / 2=Finalizado');
            $table->timestamps();

            $table->foreign('tipo_hecho_id')->references('id')->on('RAT_CAT_TIPO_HECHO');
            $table->foreign('id_usuario_perito')->references('id_user')->on('sys_users');
        });

        // ── RAT_UBICACION_VIA ─────────────────────────────────────────────────
        Schema::create('RAT_UBICACION_VIA', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique()->comment('UUID publico - usar en URLs y API');
            $table->unsignedBigInteger('incidente_id')->unique();
            // Direccion
            $table->string('calle', 200)->nullable();
            $table->string('numero_exterior', 20)->nullable();
            $table->string('colonia', 100)->nullable();
            $table->string('codigo_postal', 10)->nullable();
            $table->string('municipio', 100)->nullable();
            $table->string('estado_republica', 100)->nullable();
            $table->string('pais', 100)->default('Mexico');
            $table->text('referencia_adicional')->nullable();
            $table->string('km_punto', 50)->nullable()->comment('Ej: Km 93+500');
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            // Caracteristicas de la via
            $table->integer('velocidad_maxima_permitida_kmh')->nullable();
            $table->unsignedInteger('tipo_via_id')->nullable();
            $table->unsignedInteger('tipo_trazo_id')->nullable();
            $table->unsignedInteger('tipo_interseccion_id')->nullable();
            $table->unsignedInteger('senalamiento_vertical_id')->nullable();
            $table->unsignedInteger('senalamiento_horizontal_id')->nullable();
            $table->decimal('medidas_via_m', 6, 2)->nullable()->comment('Ancho de la via en metros');
            $table->unsignedInteger('orientacion_id')->nullable();
            $table->unsignedInteger('sentido_vialidad_id')->nullable();
            // Condiciones al momento del hecho
            $table->unsignedInteger('condicion_superficie_id')->nullable();
            $table->unsignedInteger('condicion_pavimento_id')->nullable();
            $table->unsignedInteger('tipo_pavimento_id')->nullable();
            $table->unsignedInteger('clima_id')->nullable();
            // Coeficientes de calculo
            $table->decimal('mu_coeficiente_adherencia', 5, 4)->nullable()->comment('Lookup RAT_TABLA_MU');
            $table->decimal('inclinacion_pct', 6, 3)->nullable()->comment('+ rampa / − pendiente');
            $table->decimal('mu_corregido', 5, 4)->nullable()->comment('CALCULADO: mu ± inclinacion/100');
            $table->decimal('radio_curva_m', 8, 2)->nullable()->comment('Para velocidad de derrape/vuelco');
            $table->decimal('peraltaje_pct', 6, 3)->nullable()->comment('Para velocidad de derrape');

            $table->foreign('incidente_id')->references('id')->on('RAT_INCIDENTE');
            $table->foreign('tipo_via_id')->references('id')->on('RAT_CAT_TIPO_VIA');
            $table->foreign('tipo_trazo_id')->references('id')->on('RAT_CAT_TIPO_TRAZO');
            $table->foreign('tipo_interseccion_id')->references('id')->on('RAT_CAT_TIPO_INTERSECCION');
            $table->foreign('senalamiento_vertical_id')->references('id')->on('RAT_CAT_SENALAMIENTO_VERTICAL');
            $table->foreign('senalamiento_horizontal_id')->references('id')->on('RAT_CAT_SENALAMIENTO_HORIZONTAL');
            $table->foreign('orientacion_id')->references('id')->on('RAT_CAT_ORIENTACION_VIA');
            $table->foreign('sentido_vialidad_id')->references('id')->on('RAT_CAT_SENTIDO_VIALIDAD');
            $table->foreign('condicion_superficie_id')->references('id')->on('RAT_CAT_CONDICION_SUPERFICIE');
            $table->foreign('condicion_pavimento_id')->references('id')->on('RAT_CAT_CONDICION_PAVIMENTO');
            $table->foreign('tipo_pavimento_id')->references('id')->on('RAT_CAT_TIPO_PAVIMENTO');
            $table->foreign('clima_id')->references('id')->on('RAT_CAT_CLIMA');
        });

        // ── RAT_HUELLA_ESCENA ─────────────────────────────────────────────────
        Schema::create('RAT_HUELLA_ESCENA', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('ubicacion_via_id');
            $table->unsignedInteger('tipo_indicio_id');
            $table->decimal('longitud_frenado_m', 8, 2)->nullable();
            $table->decimal('longitud_derrape_m', 8, 2)->nullable();
            $table->decimal('mu_corregido_derrape', 5, 4)->nullable()
                  ->comment('CALCULADO: mu x Σsen(αi)/n');
            $table->text('descripcion_indicio')->nullable();

            $table->foreign('ubicacion_via_id')->references('id')->on('RAT_UBICACION_VIA');
            $table->foreign('tipo_indicio_id')->references('id')->on('RAT_CAT_TIPO_INDICIO');
        });

        // ── RAT_VEHICULO ──────────────────────────────────────────────────────
        Schema::create('RAT_VEHICULO', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique()->comment('UUID publico - usar en URLs y API');
            $table->string('vin', 17)->unique();
            $table->string('tipo_clase', 100)->nullable()->comment('Sedan, SUV, Camioneta…');
            $table->string('marca', 100);
            $table->string('submarca', 100)->nullable()->comment('Corolla, Hilux, Aveo…');
            $table->string('nombre_modelo', 200)->nullable()->comment('Version o trim');
            $table->year('anio_modelo');
            $table->string('tipo_vehiculo', 10)->comment('ligero / pesado');
            $table->decimal('peso_tara_kg', 8, 2)->nullable();
            $table->decimal('masa_maxima_autorizada_kg', 8, 2)->nullable()->comment('MMA');
            // Dimensiones McHenry
            $table->decimal('ancho_mm', 8, 1)->nullable()->comment('L en formula McHenry');
            $table->decimal('largo_mm', 8, 1)->nullable();
            $table->decimal('alto_mm', 8, 1)->nullable();
            $table->decimal('batalla_mm', 8, 1)->nullable()->comment('CRITICO: determina categoria McHenry');
            $table->decimal('voladizo_anterior_mm', 8, 1)->nullable();
            $table->decimal('voladizo_posterior_mm', 8, 1)->nullable();
            $table->decimal('entrevia_delantera_mm', 8, 1)->nullable();
            $table->decimal('entrevia_trasera_mm', 8, 1)->nullable();
            $table->decimal('redondez_vertices_mm', 8, 1)->nullable();
            $table->decimal('centro_gravedad_m', 5, 3)->nullable()
                  ->comment('Altura del CG desde el piso - para E_vuelco');
            $table->timestamps();
        });

        // ── RAT_INCIDENTE_VEHICULO ────────────────────────────────────────────
        // Pivote central del analisis. uuid expuesto en URLs/API.
        Schema::create('RAT_INCIDENTE_VEHICULO', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique()->comment('UUID publico - usar en URLs y API');
            $table->unsignedBigInteger('incidente_id');
            $table->unsignedBigInteger('vehiculo_id');
            $table->string('numero_placas', 20)->nullable();
            $table->unsignedInteger('color_id')->nullable();
            $table->unsignedInteger('estado_neumatico_id')->nullable()
                  ->comment('Condicion del neumatico al momento del siniestro');
            $table->char('rol', 1)->comment('A=principal / B=tercero / C=otro');
            $table->timestamps();

            $table->foreign('incidente_id')->references('id')->on('RAT_INCIDENTE');
            $table->foreign('vehiculo_id')->references('id')->on('RAT_VEHICULO');
            $table->foreign('color_id')->references('id')->on('RAT_CAT_COLOR');
            $table->foreign('estado_neumatico_id')->references('id')->on('RAT_CAT_ESTADO_NEUMATICO');
        });

        // ── RAT_OCUPACION_CARGA ───────────────────────────────────────────────
        Schema::create('RAT_OCUPACION_CARGA', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id')->unique();
            $table->integer('numero_ocupantes')->nullable();
            $table->decimal('peso_conductor_kg', 6, 2)->nullable();
            $table->decimal('peso_pasajeros_kg', 7, 2)->nullable()
                  ->comment('Suma de todos los pasajeros');
            $table->decimal('peso_equipaje_kg', 7, 2)->nullable()
                  ->comment('Incluye carga, canastilla y accesorios');
            $table->decimal('masa_total_kg', 8, 2)->nullable()
                  ->comment('CALCULADA: tara + conductor + pasajeros + equipaje');

            $table->foreign('incidente_vehiculo_id')->references('id')->on('RAT_INCIDENTE_VEHICULO');
        });

        // ── RAT_FOTO ──────────────────────────────────────────────────────────
        Schema::create('RAT_FOTO', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id');
            $table->unsignedInteger('tipo_foto_id');
            $table->string('url', 500);
            $table->string('descripcion', 500)->nullable();
            $table->dateTime('tomada_en')->nullable();

            $table->foreign('incidente_vehiculo_id')->references('id')->on('RAT_INCIDENTE_VEHICULO');
            $table->foreign('tipo_foto_id')->references('id')->on('RAT_CAT_TIPO_FOTO');
        });

        // ── RAT_REPORTE ───────────────────────────────────────────────────────
        Schema::create('RAT_REPORTE', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('uuid')->unique()->comment('UUID publico - usar en URLs y API');
            $table->unsignedBigInteger('incidente_id');
            $table->unsignedBigInteger('id_usuario_perito')->comment('FK → sys_users.id_user');
            $table->string('numero_formato', 50)->nullable()->comment('FOR-MPT-RAT-XX Rev.XX');
            $table->string('tipo_documento', 20)->comment('informe / dictamen');
            $table->tinyInteger('nivel_emergencia')->nullable()->comment('1 / 2 / 3');
            $table->date('fecha_elaboracion')->nullable();
            $table->string('ubicacion_taller', 300)->nullable();
            $table->string('ruta_documento_word', 500)->nullable();
            $table->tinyInteger('estado')->default(0)
                  ->comment('0=borrador / 1=revision / 2=emitido');
            $table->integer('intentos_emision')->default(0);
            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_emision')->nullable();
            $table->timestamps();

            $table->foreign('incidente_id')->references('id')->on('RAT_INCIDENTE');
            $table->foreign('id_usuario_perito')->references('id_user')->on('sys_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('RAT_REPORTE');
        Schema::dropIfExists('RAT_FOTO');
        Schema::dropIfExists('RAT_OCUPACION_CARGA');
        Schema::dropIfExists('RAT_INCIDENTE_VEHICULO');
        Schema::dropIfExists('RAT_VEHICULO');
        Schema::dropIfExists('RAT_HUELLA_ESCENA');
        Schema::dropIfExists('RAT_UBICACION_VIA');
        Schema::dropIfExists('RAT_INCIDENTE');
    }
};