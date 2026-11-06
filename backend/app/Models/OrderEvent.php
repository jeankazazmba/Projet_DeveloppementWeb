<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderEvent extends Model
{
    public $timestamps = false;
    protected $hidden = ['actor_id'];
    protected $fillable = ['order_id', 'actor_id', 'from_status', 'to_status', 'action', 'reason', 'order_version', 'created_at'];
}
