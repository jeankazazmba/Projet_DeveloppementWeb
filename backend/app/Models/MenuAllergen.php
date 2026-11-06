<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuAllergen extends Model
{
    protected $attributes = ['version' => 1];
    protected $fillable = ['restaurant_id', 'name', 'version'];
    protected function casts(): array { return ['version' => 'integer']; }
}
