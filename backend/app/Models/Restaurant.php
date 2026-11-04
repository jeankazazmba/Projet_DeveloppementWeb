<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'location', 'hours', 'description', 'is_public', 'is_demo'];

    protected function casts(): array
    {
        return ['is_public' => 'boolean', 'is_demo' => 'boolean'];
    }

    public function contents()
    {
        return $this->hasMany(RestaurantContent::class);
    }
}
