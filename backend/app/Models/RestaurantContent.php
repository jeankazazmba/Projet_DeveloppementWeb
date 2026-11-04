<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantContent extends Model
{
    protected $fillable = ['kind', 'title', 'description', 'price_cdf', 'image_url', 'details', 'is_published'];

    protected function casts(): array
    {
        return ['details' => 'array', 'is_published' => 'boolean', 'price_cdf' => 'integer'];
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
