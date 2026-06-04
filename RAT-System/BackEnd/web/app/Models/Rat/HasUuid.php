<?php

namespace App\Models\Rat;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait HasUuid
{
    protected static function bootHasUuid(): void
    {
        static::creating(function (Model $model) {
            $model->uuid ??= (string) Str::uuid();
        });
    }

    public static function findByUuid(string $uuid): ?static
    {
        return static::where('uuid', $uuid)->first();
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
