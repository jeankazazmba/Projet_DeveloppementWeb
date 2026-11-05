<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $attributes = ['version' => 1];
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'restaurant_id', 'user_id', 'customer_name', 'service', 'status', 'amount_cdf', 'subtotal_cdf', 'delivery_fee_cdf', 'service_slot_id', 'delivery_address_id', 'delivery_address_snapshot', 'requested_at', 'idempotency_key', 'request_hash', 'version'];
    protected $hidden = ['idempotency_key', 'request_hash'];
    protected function casts(): array { return ['amount_cdf' => 'integer', 'subtotal_cdf' => 'integer', 'delivery_fee_cdf' => 'integer', 'delivery_address_snapshot' => 'array', 'version' => 'integer', 'requested_at' => 'datetime']; }
    public function lines() { return $this->hasMany(OrderLine::class); }
    public function events() { return $this->hasMany(OrderEvent::class); }
    public function address() { return $this->belongsTo(DeliveryAddress::class, 'delivery_address_id'); }
}
