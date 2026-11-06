<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuOption extends Model
{
    protected $attributes = ['version' => 1];
    protected $fillable = ['content_id', 'kind', 'name', 'price_delta_cdf', 'is_available', 'stock_quantity', 'version'];
    protected function casts(): array { return ['price_delta_cdf' => 'integer', 'is_available' => 'boolean', 'stock_quantity' => 'integer', 'version' => 'integer']; }
}
