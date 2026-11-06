<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'content_id', 'variant_id', 'supplement_ids', 'quantity'];
    protected function casts(): array { return ['supplement_ids' => 'array', 'quantity' => 'integer']; }
}
