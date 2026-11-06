<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderLine extends Model
{
    protected $fillable = ['order_id', 'content_id', 'title_snapshot', 'options_snapshot', 'quantity', 'unit_price_cdf', 'line_total_cdf', 'stock_reserved'];
    protected function casts(): array { return ['options_snapshot' => 'array', 'quantity' => 'integer', 'unit_price_cdf' => 'integer', 'line_total_cdf' => 'integer', 'stock_reserved' => 'boolean']; }
}
