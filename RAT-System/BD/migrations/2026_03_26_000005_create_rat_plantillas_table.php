<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── RAT_PLANTILLA ─────────────────────────────────────────────────────
        Schema::create('RAT_PLANTILLA', function (Blueprint $table) {
            $table->increments('id');
            $table->string('tipo_documento', 20)->comment('informe / dictamen');
            $table->string('version', 20)->comment('Rev.00, Rev.01…');
            $table->boolean('activa')->default(false);
            $table->string('descripcion', 300)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // ── RAT_PLANTILLA_SECCION ─────────────────────────────────────────────
        Schema::create('RAT_PLANTILLA_SECCION', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('plantilla_id');
            $table->string('numero_seccion', 20)->comment('Ej: 1, 4.1.1, 7.1');
            $table->string('titulo', 300);
            $table->integer('orden');
            $table->boolean('es_visible')->default(true);

            $table->foreign('plantilla_id')->references('id')->on('RAT_PLANTILLA');
        });

        // ── RAT_PLANTILLA_PARRAFO ─────────────────────────────────────────────
        Schema::create('RAT_PLANTILLA_PARRAFO', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('seccion_id');
            $table->integer('orden');
            $table->string('tipo', 30)
                  ->comment('texto_fijo / texto_variable / tabla / foto / formula / dinamica');
            $table->text('contenido_fijo')->nullable()
                  ->comment('Texto base con {{claves}} embebidas');
            $table->string('fuente_variable', 200)->nullable()
                  ->comment('Tabla.columna - null si es fijo');
            $table->string('condicion', 200)->nullable()
                  ->comment('Ej: aplica_vuelco=1');

            $table->foreign('seccion_id')->references('id')->on('RAT_PLANTILLA_SECCION');
        });

        // ── RAT_PLANTILLA_VARIABLE ────────────────────────────────────────────
        Schema::create('RAT_PLANTILLA_VARIABLE', function (Blueprint $table) {
            $table->increments('id');
            $table->string('clave', 100)->unique()
                  ->comment('Ej: {{marca}}, {{velocidad_final_kmh}}');
            $table->string('descripcion', 300)->nullable();
            $table->string('tabla_origen', 100);
            $table->string('columna_origen', 100);
            $table->string('formato', 50)->nullable()
                  ->comment('texto / decimal_2 / fecha_larga / mayusculas');
        });

        DB::table('RAT_PLANTILLA_VARIABLE')->insert([
            ['clave' => '{{marca}}',                'descripcion' => 'Marca del vehiculo',                    'tabla_origen' => 'RAT_VEHICULO',           'columna_origen' => 'marca',                          'formato' => 'mayusculas'],
            ['clave' => '{{submarca}}',             'descripcion' => 'Submarca / tipo del vehiculo',          'tabla_origen' => 'RAT_VEHICULO',           'columna_origen' => 'submarca',                       'formato' => 'mayusculas'],
            ['clave' => '{{color}}',                'descripcion' => 'Color del vehiculo',                    'tabla_origen' => 'RAT_CAT_COLOR',          'columna_origen' => 'nombre',                         'formato' => 'texto'],
            ['clave' => '{{placas}}',               'descripcion' => 'Numero de placas',                      'tabla_origen' => 'RAT_INCIDENTE_VEHICULO', 'columna_origen' => 'numero_placas',                  'formato' => 'mayusculas'],
            ['clave' => '{{anio_modelo}}',          'descripcion' => 'Ano modelo del vehiculo',               'tabla_origen' => 'RAT_VEHICULO',           'columna_origen' => 'anio_modelo',                    'formato' => 'texto'],
            ['clave' => '{{vin}}',                  'descripcion' => 'Numero de serie (VIN)',                  'tabla_origen' => 'RAT_VEHICULO',           'columna_origen' => 'vin',                            'formato' => 'mayusculas'],
            ['clave' => '{{fecha_hecho}}',          'descripcion' => 'Fecha del siniestro',                   'tabla_origen' => 'RAT_INCIDENTE',          'columna_origen' => 'fecha_hecho',                    'formato' => 'fecha_larga'],
            ['clave' => '{{hora_hecho}}',           'descripcion' => 'Hora del siniestro',                    'tabla_origen' => 'RAT_INCIDENTE',          'columna_origen' => 'hora_hecho',                     'formato' => 'texto'],
            ['clave' => '{{tipo_hecho}}',           'descripcion' => 'Tipo de hecho de transito',             'tabla_origen' => 'RAT_CAT_TIPO_HECHO',     'columna_origen' => 'nombre',                         'formato' => 'texto'],
            ['clave' => '{{km_punto}}',             'descripcion' => 'Kilometro del punto del hecho',         'tabla_origen' => 'RAT_UBICACION_VIA',      'columna_origen' => 'km_punto',                       'formato' => 'texto'],
            ['clave' => '{{municipio}}',            'descripcion' => 'Municipio del hecho',                   'tabla_origen' => 'RAT_UBICACION_VIA',      'columna_origen' => 'municipio',                      'formato' => 'texto'],
            ['clave' => '{{estado_republica}}',     'descripcion' => 'Estado de la republica',                'tabla_origen' => 'RAT_UBICACION_VIA',      'columna_origen' => 'estado_republica',               'formato' => 'texto'],
            ['clave' => '{{tipo_via}}',             'descripcion' => 'Tipo de via',                           'tabla_origen' => 'RAT_CAT_TIPO_VIA',       'columna_origen' => 'nombre',                         'formato' => 'texto'],
            ['clave' => '{{velocidad_max_kmh}}',    'descripcion' => 'Velocidad maxima permitida',            'tabla_origen' => 'RAT_UBICACION_VIA',      'columna_origen' => 'velocidad_maxima_permitida_kmh', 'formato' => 'texto'],
            ['clave' => '{{numero_siniestro}}',     'descripcion' => 'Numero de siniestro',                   'tabla_origen' => 'RAT_INCIDENTE',          'columna_origen' => 'numero_siniestro',               'formato' => 'mayusculas'],
            ['clave' => '{{numero_formato}}',       'descripcion' => 'Numero de formato del reporte',         'tabla_origen' => 'RAT_REPORTE',            'columna_origen' => 'numero_formato',                 'formato' => 'texto'],
            ['clave' => '{{velocidad_final_kmh}}',  'descripcion' => 'Velocidad final calculada (km/h)',      'tabla_origen' => 'RAT_CALCULO_VELOCIDAD',  'columna_origen' => 'velocidad_final_kmh',            'formato' => 'decimal_2'],
            ['clave' => '{{exceso_velocidad}}',     'descripcion' => 'Indica si hubo exceso de velocidad',   'tabla_origen' => 'RAT_CALCULO_VELOCIDAD',  'columna_origen' => 'exceso_velocidad',               'formato' => 'texto'],
            ['clave' => '{{e_deformacion_julios}}', 'descripcion' => 'Energia de deformacion (J)',           'tabla_origen' => 'RAT_CALCULO_VELOCIDAD',  'columna_origen' => 'e_deformacion_julios',           'formato' => 'decimal_3'],
            ['clave' => '{{e_vuelco_julios}}',      'descripcion' => 'Energia de vuelco (J)',                'tabla_origen' => 'RAT_CALCULO_VELOCIDAD',  'columna_origen' => 'e_vuelco_julios',                'formato' => 'decimal_3'],
            ['clave' => '{{e_total_julios}}',       'descripcion' => 'Energia total (J)',                    'tabla_origen' => 'RAT_CALCULO_VELOCIDAD',  'columna_origen' => 'e_total_julios',                 'formato' => 'decimal_3'],
            ['clave' => '{{narracion_hechos}}',     'descripcion' => 'Narracion dinamica del hecho',         'tabla_origen' => 'RAT_NARRATIVA_DINAMICA', 'columna_origen' => 'narracion_hechos',               'formato' => 'texto'],
            ['clave' => '{{objeto_involucrado}}',   'descripcion' => 'Objeto fijo / vehiculo involucrado',   'tabla_origen' => 'RAT_NARRATIVA_DINAMICA', 'columna_origen' => 'objeto_involucrado',             'formato' => 'texto'],
            ['clave' => '{{perito_nombre}}',        'descripcion' => 'Nombre del perito elaborador',         'tabla_origen' => 'sys_users',              'columna_origen' => 'name',                           'formato' => 'mayusculas'],
            ['clave' => '{{perito_cedula}}',        'descripcion' => 'Cedula profesional del perito',        'tabla_origen' => 'RAT_PERITO_PERFIL',      'columna_origen' => 'cedula_profesional',             'formato' => 'texto'],
            ['clave' => '{{perito_especialidad}}',  'descripcion' => 'Especialidad del perito',              'tabla_origen' => 'RAT_PERITO_PERFIL',      'columna_origen' => 'especialidad',                   'formato' => 'texto'],
            ['clave' => '{{fecha_elaboracion}}',    'descripcion' => 'Fecha de elaboracion del documento',   'tabla_origen' => 'RAT_REPORTE',            'columna_origen' => 'fecha_elaboracion',              'formato' => 'fecha_larga'],
            ['clave' => '{{ubicacion_taller}}',     'descripcion' => 'Taller donde se encuentra el vehiculo','tabla_origen' => 'RAT_REPORTE',            'columna_origen' => 'ubicacion_taller',               'formato' => 'texto'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('RAT_PLANTILLA_VARIABLE');
        Schema::dropIfExists('RAT_PLANTILLA_PARRAFO');
        Schema::dropIfExists('RAT_PLANTILLA_SECCION');
        Schema::dropIfExists('RAT_PLANTILLA');
    }
};
