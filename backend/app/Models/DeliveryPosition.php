<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryPosition extends Model
{
    public $timestamps = false;
    protected $fillable = ['order_id', 'actor_id', 'latitude', 'longitude', 'recorded_at'];
    protected $hidden = ['actor_id'];
    protected function casts(): array { return ['latitude' => 'float', 'longitude' => 'float', 'recorded_at' => 'datetime']; }
}
