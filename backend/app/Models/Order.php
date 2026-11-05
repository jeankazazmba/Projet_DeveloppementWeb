<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $attributes = ['version' => 1];
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'restaurant_id', 'user_id', 'customer_name', 'service', 'status', 'amount_cdf', 'subtotal_cdf', 'delivery_fee_cdf', 'service_slot_id', 'delivery_address_id', 'delivery_address_snapshot', 'delivery_zone_id', 'delivery_zone_snapshot', 'delivery_assignee_id', 'delivery_assigned_at', 'dining_table_id', 'party_size', 'requested_at', 'idempotency_key', 'request_hash', 'version'];
    protected $hidden = ['idempotency_key', 'request_hash'];
    protected function casts(): array { return ['amount_cdf' => 'integer', 'subtotal_cdf' => 'integer', 'delivery_fee_cdf' => 'integer', 'party_size' => 'integer', 'delivery_address_snapshot' => 'array', 'delivery_zone_snapshot' => 'array', 'version' => 'integer', 'requested_at' => 'datetime', 'delivery_assigned_at' => 'datetime']; }
    public function lines() { return $this->hasMany(OrderLine::class); }
    public function events() { return $this->hasMany(OrderEvent::class); }
    public function address() { return $this->belongsTo(DeliveryAddress::class, 'delivery_address_id'); }
    public function table() { return $this->belongsTo(DiningTable::class, 'dining_table_id'); }
    public function deliveryZone() { return $this->belongsTo(DeliveryZone::class, 'delivery_zone_id'); }
    public function positions() { return $this->hasMany(DeliveryPosition::class); }
    public function reservation() { return $this->hasOne(TableReservation::class); }
}
