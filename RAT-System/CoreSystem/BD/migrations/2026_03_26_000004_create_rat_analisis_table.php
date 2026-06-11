<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── RAT_DEFORMACION_MEDICION ──────────────────────────────────────────
        Schema::create('RAT_DEFORMACION_MEDICION', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id')->unique();
            $table->unsignedInteger('tipo_golpe_id');
            $table->unsignedInteger('numero_mediciones_id');
            $table->decimal('c1_m', 5, 3);
            $table->decimal('c2_m', 5, 3);
            $table->decimal('c3_m', 5, 3);
            $table->decimal('c4_m', 5, 3)->nullable()->comment('null si mediciones < 4');
            $table->decimal('c5_m', 5, 3)->nullable()->comment('null si mediciones < 4');
            $table->decimal('c6_m', 5, 3)->nullable()->comment('null si mediciones < 6');
            $table->decimal('l_ancho_contacto_m', 6, 3)->nullable()
                  ->comment('CALCULADA o medida en campo');
            $table->decimal('angulo_fpi_grados', 6, 2)->nullable()
                  ->comment('Angulo de la fuerza principal de impacto');
            $table->decimal('arqueamiento_cm', 6, 2)->nullable()
                  ->comment('Si > 10 cm se suma lateralmente');
            $table->decimal('linea_referencia_mm', 8, 1)->nullable()
                  ->comment('CALCULADA: batalla + voladizo');

            $table->foreign('incidente_vehiculo_id')->references('id')->on('RAT_INCIDENTE_VEHICULO');
            $table->foreign('tipo_golpe_id')->references('id')->on('RAT_CAT_TIPO_GOLPE');
            $table->foreign('numero_mediciones_id')->references('id')->on('RAT_CAT_NUMERO_MEDICIONES');
        });

        // ── RAT_MODALIDAD_DANO ────────────────────────────────────────────────
        Schema::create('RAT_MODALIDAD_DANO', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id');
            $table->unsignedInteger('zona_vehiculo_id');
            $table->unsignedInteger('parte_vehiculo_id');
            $table->unsignedInteger('tipo_dano_id');
            $table->unsignedInteger('cuerpo_generador_id');
            $table->unsignedInteger('direccion_dano_id');
            $table->unsignedInteger('consecuencia_id');
            $table->text('descripcion_libre')->nullable();

            $table->foreign('incidente_vehiculo_id')->references('id')->on('RAT_INCIDENTE_VEHICULO');
            $table->foreign('zona_vehiculo_id')->references('id')->on('RAT_CAT_ZONA_VEHICULO');
            $table->foreign('parte_vehiculo_id')->references('id')->on('RAT_CAT_PARTE_VEHICULO');
            $table->foreign('tipo_dano_id')->references('id')->on('RAT_CAT_TIPO_DANO');
            $table->foreign('cuerpo_generador_id')->references('id')->on('RAT_CAT_CUERPO_GENERADOR');
            $table->foreign('direccion_dano_id')->references('id')->on('RAT_CAT_DIRECCION_DANO');
            $table->foreign('consecuencia_id')->references('id')->on('RAT_CAT_CONSECUENCIA_DANO');
        });

        // ── RAT_CALCULO_VELOCIDAD ─────────────────────────────────────────────
        Schema::create('RAT_CALCULO_VELOCIDAD', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id')->unique();
            // McHenry deformacion
            $table->integer('categoria_mchenry')->nullable()->comment('CALCULADA desde batalla_mm');
            $table->decimal('a_rigidez_n_m', 12, 3)->nullable()->comment('Lookup RAT_TABLA_RIGIDEZ_AB');
            $table->decimal('b_rigidez_n_m2', 12, 3)->nullable()->comment('Lookup RAT_TABLA_RIGIDEZ_AB');
            $table->decimal('e_deformacion_julios', 14, 3)->nullable()
                  ->comment('CALCULADA: formula McHenry 2/4/6 puntos');
            $table->decimal('e_def_corregida_julios', 14, 3)->nullable()
                  ->comment('CALCULADA: Edef x (1 + tan α)');
            // Energia de vuelco
            $table->boolean('aplica_vuelco')->default(false)->comment('0=no / 1=si');
            $table->decimal('angulo_vuelco_grados', 6, 2)->nullable()
                  ->comment('Angulo de inclinacion para calcular H');
            $table->decimal('hipotenusa_vuelco_m', 6, 3)->nullable()
                  ->comment('Generalmente ancho_mm / 2');
            $table->decimal('h_altura_critica_m', 6, 3)->nullable()
                  ->comment('CALCULADA: sin(angulo) x hipotenusa');
            $table->decimal('centro_gravedad_m', 5, 3)->nullable()
                  ->comment('Desnorm. desde RAT_VEHICULO.centro_gravedad_m');
            $table->decimal('e_vuelco_julios', 14, 3)->nullable()
                  ->comment('CALCULADA: m x g x (H − h)');
            $table->decimal('e_total_julios', 14, 3)->nullable()
                  ->comment('CALCULADA: e_def_corregida + e_vuelco');
            // EBS y velocidad de impacto
            $table->decimal('ebs_m_s', 8, 4)->nullable()
                  ->comment('CALCULADA: sqrt(2 x E_total / masa_total)');
            $table->decimal('velocidad_impacto_kmh', 8, 2)->nullable()
                  ->comment('CALCULADA: EBS x 3.6');
            // Verificacion Limpert
            $table->decimal('dmed_m', 6, 3)->nullable()->comment('CALCULADA: media Ci');
            $table->decimal('velocidad_limpert_kmh', 8, 2)->nullable();
            $table->decimal('vel_limpert_margenerror_kmh', 8, 2)->nullable()
                  ->comment('± 4.4 x Dmed');
            // Pre-impacto (frenado)
            $table->decimal('e_frenado_julios', 14, 3)->nullable()
                  ->comment('CALCULADA: mu x m x g x d');
            $table->decimal('velocidad_pre_impacto_kmh', 8, 2)->nullable();
            $table->unsignedInteger('tiempo_frenos_id')->nullable();
            $table->decimal('tiempo_respuesta_frenos_s', 4, 2)->nullable()
                  ->comment('Desnorm. para auditoria');
            // Resultado final
            $table->decimal('velocidad_final_kmh', 8, 2)->nullable()
                  ->comment('Resultado reportado en el dictamen');
            $table->boolean('exceso_velocidad')->nullable()->comment('0=no / 1=si');
            $table->decimal('delta_exceso_kmh', 8, 2)->nullable()
                  ->comment('vel_final − vel_max_permitida');
            $table->decimal('margen_error_kmh', 6, 2)->nullable()->default(10.00);

            $table->foreign('incidente_vehiculo_id')->references('id')->on('RAT_INCIDENTE_VEHICULO');
            $table->foreign('tiempo_frenos_id')->references('id')->on('RAT_TABLA_TIEMPO_FRENOS');
        });

        // ── RAT_FASE_ACCIDENTE ────────────────────────────────────────────────
        Schema::create('RAT_FASE_ACCIDENTE', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id')->unique();
            $table->unsignedInteger('posicion_inicial_id')->nullable();
            $table->unsignedInteger('percepcion_real_id')->nullable()->comment('PPR');
            $table->string('factores_percepcion', 500)->nullable();
            $table->unsignedInteger('punto_clave_id')->nullable()->comment('PC');
            $table->string('factores_punto_clave', 500)->nullable();
            $table->unsignedInteger('zona_impacto_id')->nullable();
            $table->unsignedInteger('trayectoria_post_id')->nullable();

            $table->foreign('incidente_vehiculo_id')->references('id')->on('RAT_INCIDENTE_VEHICULO');
            $table->foreign('posicion_inicial_id')->references('id')->on('RAT_CAT_POSICION_INICIAL');
            $table->foreign('percepcion_real_id')->references('id')->on('RAT_CAT_PERCEPCION_REAL');
            $table->foreign('punto_clave_id')->references('id')->on('RAT_CAT_PUNTO_CLAVE');
            $table->foreign('zona_impacto_id')->references('id')->on('RAT_CAT_ZONA_VEHICULO');
            $table->foreign('trayectoria_post_id')->references('id')->on('RAT_CAT_TRAYECTORIA_POST');
        });

        // ── RAT_NARRATIVA_DINAMICA ────────────────────────────────────────────
        Schema::create('RAT_NARRATIVA_DINAMICA', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id')->unique();
            $table->text('narracion_hechos')->nullable();
            $table->string('objeto_involucrado', 200)->nullable();
            $table->text('descripcion_objeto_fijo')->nullable();
            $table->string('posicion_final_vehiculo', 300)->nullable();
            $table->string('direccion_circulacion', 200)->nullable();
            $table->decimal('distancia_ppr_al_pc_m', 8, 2)->nullable()
                  ->comment('CALCULADA: PPR-PD-frenada-PC');
            $table->decimal('tiempo_reaccion_conductor_s', 4, 2)->nullable()->default(1.00);
            $table->decimal('huellas_frenado_m', 8, 2)->nullable();
            $table->decimal('huellas_derrape_m', 8, 2)->nullable();

            $table->foreign('incidente_vehiculo_id')->references('id')->on('RAT_INCIDENTE_VEHICULO');
        });

        // ── RAT_PRINCIPIOS_FORENSES ───────────────────────────────────────────
        Schema::create('RAT_PRINCIPIOS_FORENSES', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id')->unique();
            $table->text('principio_intercambio_materiales')->nullable();
            $table->text('principio_correspondencia')->nullable();
            $table->text('dinamica_colision_fases')->nullable()
                  ->comment('Percepcion-Decision-Frenada-Impacto-Post');

            $table->foreign('incidente_vehiculo_id')->references('id')->on('RAT_INCIDENTE_VEHICULO');
        });

        // ── RAT_CONCLUSION ────────────────────────────────────────────────────
        Schema::create('RAT_CONCLUSION', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('principios_forenses_id');
            $table->integer('orden');
            $table->text('texto_conclusion');
            $table->boolean('validado_perito')->default(false)
                  ->comment('0=pendiente / 1=validado');
            $table->unsignedInteger('validado_por_id')->nullable()
                  ->comment('FK → sys_users.id_user');
            $table->dateTime('validado_en')->nullable();

            $table->foreign('principios_forenses_id')->references('id')->on('RAT_PRINCIPIOS_FORENSES');
            $table->foreign('validado_por_id')->references('id_user')->on('sys_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('RAT_CONCLUSION');
        Schema::dropIfExists('RAT_PRINCIPIOS_FORENSES');
        Schema::dropIfExists('RAT_NARRATIVA_DINAMICA');
        Schema::dropIfExists('RAT_FASE_ACCIDENTE');
        Schema::dropIfExists('RAT_CALCULO_VELOCIDAD');
        Schema::dropIfExists('RAT_MODALIDAD_DANO');
        Schema::dropIfExists('RAT_DEFORMACION_MEDICION');
    }
};
