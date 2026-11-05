<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentEvent extends Model
{
    public $timestamps = false;
    protected $fillable = ['payment_intent_id', 'provider', 'event_id', 'from_status', 'to_status', 'payload_hash', 'intent_version', 'created_at'];
    protected $hidden = ['payload_hash'];
}
