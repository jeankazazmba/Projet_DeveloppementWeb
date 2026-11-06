<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceSlot extends Model
{
    protected $attributes = ['version' => 1];
    protected $fillable = ['restaurant_id', 'service', 'weekday', 'starts_at', 'ends_at', 'is_active', 'version'];
    protected function casts(): array { return ['weekday' => 'integer', 'is_active' => 'boolean', 'version' => 'integer']; }
}
