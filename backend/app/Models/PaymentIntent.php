<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentIntent extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $attributes = ['version' => 1, 'currency' => 'CDF'];
    protected $fillable = ['id', 'order_id', 'restaurant_id', 'user_id', 'payment_method_id', 'provider', 'status', 'amount_cdf', 'currency', 'idempotency_key', 'request_hash', 'external_reference', 'version'];
    protected $hidden = ['idempotency_key', 'request_hash'];
    protected function casts(): array { return ['amount_cdf' => 'integer', 'version' => 'integer']; }
    public function events() { return $this->hasMany(PaymentEvent::class); }
}
