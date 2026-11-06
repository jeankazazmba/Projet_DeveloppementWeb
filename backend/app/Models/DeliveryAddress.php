<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryAddress extends Model
{
    protected $attributes = ['version' => 1];
    protected $fillable = ['user_id', 'label', 'address_line', 'district', 'city', 'phone', 'version'];
    protected function casts(): array { return ['version' => 'integer']; }
}
