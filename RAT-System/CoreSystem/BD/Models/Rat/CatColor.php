<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;

class CatColor extends Model
{
    protected $table      = 'RAT_CAT_COLOR';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}
