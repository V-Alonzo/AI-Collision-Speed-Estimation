<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatTipoPavimento extends Model
{
    protected $table      = 'RAT_CAT_TIPO_PAVIMENTO';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
