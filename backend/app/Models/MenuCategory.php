<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuCategory extends Model
{
    protected $attributes = ['version' => 1];
    protected $fillable = ['restaurant_id', 'name', 'sort_order', 'is_active', 'version'];
    protected function casts(): array { return ['is_active' => 'boolean', 'version' => 'integer']; }
}
