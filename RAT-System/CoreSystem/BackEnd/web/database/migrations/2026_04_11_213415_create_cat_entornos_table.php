<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCatEntornosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cat_entornos', function (Blueprint $table) {
            $table->id();
            $table->enum('clima', ['soleado', 'nublado', 'lluvia_ligera', 'lluvia_fuerte', 'niebla', 'granizo', 'nieve', 'otro']);
            $table->enum('tipo_via', ['autopista', 'carretera_federal', 'carretera_estatal', 'avenida', 'calle', 'callejón', 'otro']);
            $table->enum('superficie', ['asfalto', 'concreto', 'terracería', 'grava', 'adoquín', 'otro']);
            $table->enum('iluminacion', ['diurna', 'nocturna_iluminada', 'nocturna_sin_iluminar', 'atardecer']);
            $table->enum('visibilidad', ['excelente', 'buena', 'regular', 'mala', 'muy_mala']);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cat_entornos');
    }
}
