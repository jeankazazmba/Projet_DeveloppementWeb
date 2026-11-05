<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantContent extends Model
{
    protected $attributes = ['version' => 1];
    protected $fillable = ['kind', 'title', 'description', 'price_cdf', 'image_url', 'details', 'is_published', 'is_available', 'is_featured', 'category_id', 'stock_quantity', 'published_from', 'published_until', 'version'];

    protected function casts(): array
    {
        return ['details' => 'array', 'is_published' => 'boolean', 'price_cdf' => 'integer', 'is_available' => 'boolean', 'is_featured' => 'boolean', 'stock_quantity' => 'integer', 'published_from' => 'datetime', 'published_until' => 'datetime', 'version' => 'integer'];
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category() { return $this->belongsTo(MenuCategory::class); }
    public function options() { return $this->hasMany(MenuOption::class, 'content_id'); }
    public function allergens() { return $this->belongsToMany(MenuAllergen::class, 'content_allergen', 'content_id', 'allergen_id'); }

    public function scopePublicActive($query)
    {
        return $query->where('is_published', true)->where('is_available', true)
            ->where(fn ($q) => $q->whereNull('published_from')->orWhere('published_from', '<=', now()))
            ->where(fn ($q) => $q->whereNull('published_until')->orWhere('published_until', '>', now()))
            ->where(fn ($q) => $q->where('kind', '!=', 'dish')->orWhereNull('stock_quantity')->orWhere('stock_quantity', '>', 0))
            ->where(fn ($q) => $q->where('kind', '!=', 'dish')->orWhereNull('category_id')
                ->orWhereHas('category', fn ($category) => $category->where('is_active', true)));
    }
}
