<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── RAT_CAT_TIPO_HECHO ────────────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_HECHO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_HECHO')->insert([
            ['nombre' => 'Colision entre vehiculos'],
            ['nombre' => 'Atropellamiento'],
            ['nombre' => 'Caida de pasajero'],
            ['nombre' => 'Volcadura'],
            ['nombre' => 'Salida del camino'],
            ['nombre' => 'Colision con objeto fijo'],
            ['nombre' => 'Otro'],
        ]);

        // ── RAT_CAT_TIPO_VIA ──────────────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_VIA', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_VIA')->insert([
            ['nombre' => 'Autopista'],
            ['nombre' => 'Carretera federal'],
            ['nombre' => 'Carretera estatal'],
            ['nombre' => 'Vialidad urbana primaria'],
            ['nombre' => 'Vialidad urbana secundaria'],
            ['nombre' => 'Camino rural'],
            ['nombre' => 'Otra'],
        ]);

        // ── RAT_CAT_TIPO_TRAZO ────────────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_TRAZO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_TRAZO')->insert([
            ['nombre' => 'Recto'],
            ['nombre' => 'Curva'],
            ['nombre' => 'Rampa'],
            ['nombre' => 'Pendiente'],
        ]);

        // ── RAT_CAT_TIPO_INTERSECCION ─────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_INTERSECCION', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_INTERSECCION')->insert([
            ['nombre' => 'Cruce simple'],
            ['nombre' => 'Glorieta'],
            ['nombre' => 'T'],
            ['nombre' => 'Y'],
            ['nombre' => 'Paso a desnivel'],
        ]);

        // ── RAT_CAT_SENALAMIENTO_VERTICAL ─────────────────────────────────────
        Schema::create('RAT_CAT_SENALAMIENTO_VERTICAL', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_SENALAMIENTO_VERTICAL')->insert([
            ['nombre' => 'Alto'],
            ['nombre' => 'Ceda el paso'],
            ['nombre' => 'Limite de velocidad'],
            ['nombre' => 'Otro'],
        ]);

        // ── RAT_CAT_SENALAMIENTO_HORIZONTAL ──────────────────────────────────
        Schema::create('RAT_CAT_SENALAMIENTO_HORIZONTAL', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_SENALAMIENTO_HORIZONTAL')->insert([
            ['nombre' => 'Lineas continuas'],
            ['nombre' => 'Lineas discontinuas'],
            ['nombre' => 'Paso peatonal'],
            ['nombre' => 'Sentidos de circulacion'],
            ['nombre' => 'Otro'],
        ]);

        // ── RAT_CAT_CONDICION_SUPERFICIE ──────────────────────────────────────
        Schema::create('RAT_CAT_CONDICION_SUPERFICIE', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_CONDICION_SUPERFICIE')->insert([
            ['nombre' => 'Seco'],
            ['nombre' => 'Mojado'],
            ['nombre' => 'Hielo'],
            ['nombre' => 'Nieve'],
        ]);

        // ── RAT_CAT_CONDICION_PAVIMENTO ───────────────────────────────────────
        Schema::create('RAT_CAT_CONDICION_PAVIMENTO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_CONDICION_PAVIMENTO')->insert([
            ['nombre' => 'Buenas condiciones'],
            ['nombre' => 'Malas condiciones'],
        ]);

        // ── RAT_CAT_TIPO_PAVIMENTO ────────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_PAVIMENTO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_PAVIMENTO')->insert([
            ['nombre' => 'Asfalto'],
            ['nombre' => 'Concreto'],
            ['nombre' => 'Adoquin'],
            ['nombre' => 'Terraceria'],
            ['nombre' => 'Grava'],
        ]);

        // ── RAT_CAT_CLIMA ─────────────────────────────────────────────────────
        Schema::create('RAT_CAT_CLIMA', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_CLIMA')->insert([
            ['nombre' => 'Soleado'],
            ['nombre' => 'Lluvioso'],
            ['nombre' => 'Nublado'],
            ['nombre' => 'Niebla / Neblina'],
            ['nombre' => 'Granizo'],
            ['nombre' => 'Noche'],
        ]);

        // ── RAT_CAT_ORIENTACION_VIA ───────────────────────────────────────────
        Schema::create('RAT_CAT_ORIENTACION_VIA', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_ORIENTACION_VIA')->insert([
            ['nombre' => 'Norte - Sur'],
            ['nombre' => 'Sur - Norte'],
            ['nombre' => 'Este - Oeste'],
            ['nombre' => 'Oeste - Este'],
            ['nombre' => 'Noroeste - Sureste'],
            ['nombre' => 'Sureste - Noroeste'],
            ['nombre' => 'Noreste - Sureste'],
            ['nombre' => 'Sureste - Noreste'],
            ['nombre' => 'Suroeste - Noreste'],
            ['nombre' => 'Noreste - Suroeste'],
            ['nombre' => 'Noroeste - Suroeste'],
            ['nombre' => 'Suroeste - Noroeste'],
        ]);

        // ── RAT_CAT_SENTIDO_VIALIDAD ──────────────────────────────────────────
        Schema::create('RAT_CAT_SENTIDO_VIALIDAD', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_SENTIDO_VIALIDAD')->insert([
            ['nombre' => 'Un sentido'],
            ['nombre' => 'Doble sentido'],
        ]);

        // ── RAT_CAT_ESTADO_NEUMATICO ──────────────────────────────────────────
        Schema::create('RAT_CAT_ESTADO_NEUMATICO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_ESTADO_NEUMATICO')->insert([
            ['nombre' => 'Nuevo'],
            ['nombre' => 'Usado'],
        ]);

        // ── RAT_CAT_COLOR ─────────────────────────────────────────────────────
        Schema::create('RAT_CAT_COLOR', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_COLOR')->insert([
            ['nombre' => 'Blanco'],
            ['nombre' => 'Negro'],
            ['nombre' => 'Gris'],
            ['nombre' => 'Azul'],
            ['nombre' => 'Rojo'],
            ['nombre' => 'Cafe / Marron'],
            ['nombre' => 'Verde'],
            ['nombre' => 'Naranja'],
            ['nombre' => 'Otro'],
        ]);

        // ── RAT_CAT_TIPO_FOTO ─────────────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_FOTO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_FOTO')->insert([
            ['nombre' => 'Frontal'],
            ['nombre' => 'Lateral Derecho'],
            ['nombre' => 'Lateral Izquierdo'],
            ['nombre' => 'Posterior'],
            ['nombre' => 'Partes Bajas'],
            ['nombre' => 'Habitaculo'],
            ['nombre' => 'Lugar de los Hechos'],
            ['nombre' => 'Objeto Involucrado'],
        ]);

        // ── RAT_CAT_TIPO_GOLPE ────────────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_GOLPE', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_GOLPE')->insert([
            ['nombre' => 'Frontal'],
            ['nombre' => 'Trasero'],
            ['nombre' => 'Lateral'],
            ['nombre' => 'Inferior'],
            ['nombre' => 'Superior'],
        ]);

        // ── RAT_CAT_NUMERO_MEDICIONES ─────────────────────────────────────────
        Schema::create('RAT_CAT_NUMERO_MEDICIONES', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('valor')->unique();
        });
        DB::table('RAT_CAT_NUMERO_MEDICIONES')->insert([
            ['valor' => 2],
            ['valor' => 4],
            ['valor' => 6],
        ]);

        // ── RAT_CAT_TIPO_INDICIO ──────────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_INDICIO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_INDICIO')->insert([
            ['nombre' => 'Plastico'],
            ['nombre' => 'Vidrio'],
            ['nombre' => 'Pintura'],
            ['nombre' => 'Neumatico'],
            ['nombre' => 'Metal'],
            ['nombre' => 'Otro'],
        ]);

        // ── RAT_CAT_POSICION_INICIAL ──────────────────────────────────────────
        Schema::create('RAT_CAT_POSICION_INICIAL', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_POSICION_INICIAL')->insert([
            ['nombre' => 'Estacionado'],
            ['nombre' => 'Circulando'],
            ['nombre' => 'Detenido'],
            ['nombre' => 'Reversa'],
            ['nombre' => 'Invasion de carril'],
            ['nombre' => 'Cambio de carril'],
        ]);

        // ── RAT_CAT_PERCEPCION_REAL ───────────────────────────────────────────
        Schema::create('RAT_CAT_PERCEPCION_REAL', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_PERCEPCION_REAL')->insert([
            ['nombre' => 'Distraccion'],
            ['nombre' => 'Visibilidad reducida'],
            ['nombre' => 'Punto ciego'],
            ['nombre' => 'Obstaculo repentino'],
            ['nombre' => 'Fatiga'],
        ]);

        // ── RAT_CAT_PUNTO_CLAVE ───────────────────────────────────────────────
        Schema::create('RAT_CAT_PUNTO_CLAVE', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_PUNTO_CLAVE')->insert([
            ['nombre' => 'Freno brusco'],
            ['nombre' => 'Volanteo'],
            ['nombre' => 'Aceleracion'],
            ['nombre' => 'Sin reaccion'],
            ['nombre' => 'Rebase fallido'],
        ]);

        // ── RAT_CAT_TRAYECTORIA_POST ──────────────────────────────────────────
        Schema::create('RAT_CAT_TRAYECTORIA_POST', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TRAYECTORIA_POST')->insert([
            ['nombre' => 'Recta'],
            ['nombre' => 'Rotacion'],
            ['nombre' => 'Derrape'],
            ['nombre' => 'Vuelco lateral'],
            ['nombre' => 'Vuelco total'],
            ['nombre' => 'Proyeccion fuera de via'],
        ]);

        // ── RAT_CAT_ZONA_VEHICULO ─────────────────────────────────────────────
        Schema::create('RAT_CAT_ZONA_VEHICULO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_ZONA_VEHICULO')->insert([
            ['nombre' => 'Parte Frontal'],
            ['nombre' => 'Vertice Delantero Derecho'],
            ['nombre' => 'Lado Derecho'],
            ['nombre' => 'Vertice Trasero Derecho'],
            ['nombre' => 'Parte Trasera'],
            ['nombre' => 'Vertice Trasero Izquierdo'],
            ['nombre' => 'Lado Izquierdo'],
            ['nombre' => 'Vertice Delantero Izquierdo'],
            ['nombre' => 'Toldo'],
            ['nombre' => 'Habitaculo'],
            ['nombre' => 'Partes Bajas'],
        ]);

        // ── RAT_CAT_PARTE_VEHICULO ────────────────────────────────────────────
        Schema::create('RAT_CAT_PARTE_VEHICULO', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('zona_id');
            $table->string('tipo_vehiculo', 10);
            $table->string('subzona', 50)->nullable();
            $table->string('nombre', 200);
            $table->foreign('zona_id')->references('id')->on('RAT_CAT_ZONA_VEHICULO');
        });

        // ── RAT_CAT_TIPO_DANO ─────────────────────────────────────────────────
        Schema::create('RAT_CAT_TIPO_DANO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_TIPO_DANO')->insert([
            ['nombre' => 'Hundimiento'],
            ['nombre' => 'Corrimiento'],
            ['nombre' => 'Tallon'],
            ['nombre' => 'Ruptura'],
            ['nombre' => 'Repercusion'],
        ]);

        // ── RAT_CAT_CUERPO_GENERADOR ──────────────────────────────────────────
        Schema::create('RAT_CAT_CUERPO_GENERADOR', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 50)->unique();
        });
        DB::table('RAT_CAT_CUERPO_GENERADOR')->insert([
            ['nombre' => 'Duro'],
            ['nombre' => 'Blando'],
        ]);

        // ── RAT_CAT_DIRECCION_DANO ────────────────────────────────────────────
        Schema::create('RAT_CAT_DIRECCION_DANO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_DIRECCION_DANO')->insert([
            ['nombre' => 'Adelante hacia atras'],
            ['nombre' => 'Atras hacia adelante'],
            ['nombre' => 'Izquierda a derecha'],
            ['nombre' => 'Derecha a izquierda'],
            ['nombre' => 'Arriba hacia abajo'],
            ['nombre' => 'Abajo hacia arriba'],
        ]);

        // ── RAT_CAT_CONSECUENCIA_DANO ─────────────────────────────────────────
        Schema::create('RAT_CAT_CONSECUENCIA_DANO', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
        });
        DB::table('RAT_CAT_CONSECUENCIA_DANO')->insert([
            ['nombre' => 'Desprendimiento'],
            ['nombre' => 'Desplazamiento'],
            ['nombre' => 'Impregnacion'],
            ['nombre' => 'Resquebrajamiento'],
            ['nombre' => 'Oxidacion'],
            ['nombre' => 'Desacople'],
            ['nombre' => 'Derrame de liquidos automotrices'],
            ['nombre' => 'Desacople de componentes mecanicos'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('RAT_CAT_CONSECUENCIA_DANO');
        Schema::dropIfExists('RAT_CAT_DIRECCION_DANO');
        Schema::dropIfExists('RAT_CAT_CUERPO_GENERADOR');
        Schema::dropIfExists('RAT_CAT_TIPO_DANO');
        Schema::dropIfExists('RAT_CAT_PARTE_VEHICULO');
        Schema::dropIfExists('RAT_CAT_ZONA_VEHICULO');
        Schema::dropIfExists('RAT_CAT_TRAYECTORIA_POST');
        Schema::dropIfExists('RAT_CAT_PUNTO_CLAVE');
        Schema::dropIfExists('RAT_CAT_PERCEPCION_REAL');
        Schema::dropIfExists('RAT_CAT_POSICION_INICIAL');
        Schema::dropIfExists('RAT_CAT_TIPO_INDICIO');
        Schema::dropIfExists('RAT_CAT_NUMERO_MEDICIONES');
        Schema::dropIfExists('RAT_CAT_TIPO_GOLPE');
        Schema::dropIfExists('RAT_CAT_TIPO_FOTO');
        Schema::dropIfExists('RAT_CAT_COLOR');
        Schema::dropIfExists('RAT_CAT_ESTADO_NEUMATICO');
        Schema::dropIfExists('RAT_CAT_SENTIDO_VIALIDAD');
        Schema::dropIfExists('RAT_CAT_ORIENTACION_VIA');
        Schema::dropIfExists('RAT_CAT_CLIMA');
        Schema::dropIfExists('RAT_CAT_TIPO_PAVIMENTO');
        Schema::dropIfExists('RAT_CAT_CONDICION_PAVIMENTO');
        Schema::dropIfExists('RAT_CAT_CONDICION_SUPERFICIE');
        Schema::dropIfExists('RAT_CAT_SENALAMIENTO_HORIZONTAL');
        Schema::dropIfExists('RAT_CAT_SENALAMIENTO_VERTICAL');
        Schema::dropIfExists('RAT_CAT_TIPO_INTERSECCION');
        Schema::dropIfExists('RAT_CAT_TIPO_TRAZO');
        Schema::dropIfExists('RAT_CAT_TIPO_VIA');
        Schema::dropIfExists('RAT_CAT_TIPO_HECHO');
    }
};
