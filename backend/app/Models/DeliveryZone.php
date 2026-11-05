<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    protected $attributes = ['version' => 1, 'is_active' => true];
    protected $fillable = ['restaurant_id', 'district', 'fee_cdf', 'is_active', 'version'];
    protected function casts(): array { return ['fee_cdf' => 'integer', 'is_active' => 'boolean', 'version' => 'integer']; }
}
