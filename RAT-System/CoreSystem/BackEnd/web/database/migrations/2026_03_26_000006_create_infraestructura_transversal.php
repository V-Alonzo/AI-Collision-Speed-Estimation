<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── jwt_tokens — Blacklist para logout inmediato ───────────────────────
        // Sin prefijo RAT_: infraestructura transversal del sistema.
        // Permite invalidar tokens antes de su expiracion natural (24h).
        Schema::create('jwt_tokens', function (Blueprint $table) {
            $table->increments('id')->unsigned();
            $table->unsignedBigInteger('user_id');
            $table->string('token_hash', 64)->unique();
            $table->dateTime('expires_at');
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('user_id')
                  ->references('id_user')->on('sys_users')
                  ->onDelete('cascade');

            $table->index('token_hash', 'idx_jwt_token_hash');
            $table->index('expires_at',  'idx_jwt_expires');
            $table->index('user_id',     'idx_jwt_user');
        });

        // ── audit_logs — Cadena de custodia legal ─────────────────────────────
        // Sin prefijo RAT_: infraestructura transversal del sistema.
        // Registra quien cambio que dato, cuando y desde que IP.
        // Requerido para validez legal de dictamenes periciales en juicio.
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->unsignedBigInteger('user_id');
            $table->string('tabla_afectada', 100);
            $table->bigInteger('registro_id');
            $table->char('registro_uuid', 36)->nullable();
            $table->string('campo_afectado', 100)->nullable();
            $table->text('valor_anterior')->nullable();
            $table->text('valor_nuevo')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->string('ip_origen', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->dateTime('created_at')->useCurrent();

            $table->foreign('user_id')->references('id_user')->on('sys_users');

            $table->index('tabla_afectada',               'idx_audit_tabla');
            $table->index(['tabla_afectada','registro_id'],'idx_audit_registro');
            $table->index('user_id',                      'idx_audit_user');
            $table->index('created_at',                   'idx_audit_fecha');
            $table->index('accion',                       'idx_audit_accion');
        });

        // ── RAT_IA_SOLICITUD — Registro de llamadas a IA ─────────────────────
        // Registra cada interaccion con Claude API dentro del modulo RAT.
        // Cubre los 3 botones del mockup:
        //   - autocompletar_vehiculo (paso 2 - Vehiculo)
        //   - sugerencia_deformacion  (paso 6 - Deformacion)
        //   - narrativa_dinamica      (paso 8 - Narrativa)
        Schema::create('RAT_IA_SOLICITUD', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('incidente_vehiculo_id')->nullable();
            $table->unsignedBigInteger('incidente_id')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->string('tipo', 50);
            $table->enum('estado', ['pendiente','completado','error','rechazado','aceptado'])
                  ->default('pendiente');
            // Input
            $table->json('contexto_json')->nullable();
            $table->text('prompt_enviado')->nullable();
            // Output
            $table->json('respuesta_ia')->nullable();
            $table->text('texto_sugerido')->nullable();
            $table->text('texto_final')->nullable();
            $table->tinyInteger('fue_editado')->nullable();
            // Metricas
            $table->integer('tokens_entrada')->nullable();
            $table->integer('tokens_salida')->nullable();
            $table->integer('latencia_ms')->nullable();
            // Error
            $table->text('detalle_error')->nullable();
            // Timestamps
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('respondido_en')->nullable();

            $table->foreign('incidente_vehiculo_id')
                  ->references('id')->on('RAT_INCIDENTE_VEHICULO');
            $table->foreign('incidente_id')
                  ->references('id')->on('RAT_INCIDENTE');
            $table->foreign('user_id')
                  ->references('id_user')->on('sys_users');

            $table->index('tipo',                    'idx_ia_tipo');
            $table->index('estado',                  'idx_ia_estado');
            $table->index('incidente_vehiculo_id',   'idx_ia_inc_veh');
            $table->index('user_id',                 'idx_ia_user');
            $table->index('created_at',              'idx_ia_fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('RAT_IA_SOLICITUD');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('jwt_tokens');
    }
};
