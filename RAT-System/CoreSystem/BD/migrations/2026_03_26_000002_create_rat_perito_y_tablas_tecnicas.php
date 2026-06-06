<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── RAT_PERITO_PERFIL ─────────────────────────────────────────────────
        // Extiende sys_users (plataforma base) con datos propios del perito.
        Schema::create('RAT_PERITO_PERFIL', function (Blueprint $table) {
            $table->unsignedInteger('id_user')->primary()
                  ->comment('FK → sys_users.id_user (1:1)');
            $table->string('telefono', 20)->nullable();
            $table->string('cedula_profesional', 30)->nullable();
            $table->string('especialidad', 200)->nullable()
                  ->comment('Ej: Reconstruccion de Accidentes Viales');
            $table->string('numero_empleado', 30)->nullable()
                  ->comment('Ej: CESVI-MX-1048');
            $table->decimal('calificacion', 3, 1)->nullable()
                  ->comment('Rating 0.0 - 5.0');
            $table->date('fecha_alta')->nullable();

            // FK a sys_users de la plataforma base
            $table->foreign('id_user')->references('id_user')->on('sys_users');
        });

        // ── RAT_TABLA_RIGIDEZ_AB ──────────────────────────────────────────────
        Schema::create('RAT_TABLA_RIGIDEZ_AB', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('categoria_mchenry')->comment('1-5 / 6=Furgon');
            $table->decimal('batalla_min_m', 6, 3);
            $table->decimal('batalla_max_m', 6, 3);
            $table->decimal('via_delantera_ref_m', 6, 3)->nullable();
            $table->decimal('longitud_ref_m', 6, 3)->nullable();
            $table->decimal('anchura_ref_m', 6, 3)->nullable();
            $table->decimal('tara_ref_kg', 8, 2)->nullable();
            $table->unsignedInteger('tipo_golpe_id');
            $table->decimal('a_rigidez_n_m', 12, 3);
            $table->decimal('b_rigidez_n_m2', 12, 3);

            $table->foreign('tipo_golpe_id')->references('id')->on('RAT_CAT_TIPO_GOLPE');
        });

        // ── RAT_TABLA_MU ──────────────────────────────────────────────────────
        Schema::create('RAT_TABLA_MU', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('tipo_pavimento_id');
            $table->unsignedInteger('condicion_superficie_id');
            $table->unsignedInteger('estado_neumatico_id');
            $table->decimal('vel_min_kmh', 6, 2)->nullable();
            $table->decimal('vel_max_kmh', 6, 2)->nullable();
            $table->decimal('mu', 5, 4)->comment('Coeficiente de adherencia');

            $table->foreign('tipo_pavimento_id')->references('id')->on('RAT_CAT_TIPO_PAVIMENTO');
            $table->foreign('condicion_superficie_id')->references('id')->on('RAT_CAT_CONDICION_SUPERFICIE');
            $table->foreign('estado_neumatico_id')->references('id')->on('RAT_CAT_ESTADO_NEUMATICO');
        });

        // ── RAT_TABLA_TIEMPO_FRENOS ───────────────────────────────────────────
        Schema::create('RAT_TABLA_TIEMPO_FRENOS', function (Blueprint $table) {
            $table->increments('id');
            $table->decimal('eficacia_pct', 5, 2)->comment('70 / 80 / 100');
            $table->decimal('tiempo_s', 4, 2)->comment('0.2 / 0.1');
        });

        DB::table('RAT_TABLA_TIEMPO_FRENOS')->insert([
            ['eficacia_pct' => 70.00, 'tiempo_s' => 0.20],
            ['eficacia_pct' => 80.00, 'tiempo_s' => 0.20],
            ['eficacia_pct' => 100.00, 'tiempo_s' => 0.10],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('RAT_TABLA_TIEMPO_FRENOS');
        Schema::dropIfExists('RAT_TABLA_MU');
        Schema::dropIfExists('RAT_TABLA_RIGIDEZ_AB');
        Schema::dropIfExists('RAT_PERITO_PERFIL');
    }
};
