<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantContent extends Model
{
    protected $fillable = ['kind', 'title', 'description', 'price_cdf', 'image_url', 'details', 'is_published', 'is_available', 'is_featured'];

    protected function casts(): array
    {
        return ['details' => 'array', 'is_published' => 'boolean', 'price_cdf' => 'integer', 'is_available' => 'boolean', 'is_featured' => 'boolean'];
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
