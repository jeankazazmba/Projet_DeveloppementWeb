<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $attributes = ['version' => 1];
    protected $fillable = ['user_id', 'restaurant_id', 'version'];
    protected function casts(): array { return ['version' => 'integer']; }
    public function items() { return $this->hasMany(CartItem::class); }
}
