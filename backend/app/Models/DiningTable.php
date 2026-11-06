<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiningTable extends Model
{
    protected $attributes = ['version' => 1, 'is_active' => true];
    protected $fillable = ['restaurant_id', 'code', 'capacity', 'is_active', 'version'];
    protected function casts(): array { return ['capacity' => 'integer', 'is_active' => 'boolean', 'version' => 'integer']; }
}
