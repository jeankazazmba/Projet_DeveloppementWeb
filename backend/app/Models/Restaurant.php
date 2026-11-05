<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'location', 'hours', 'description', 'is_public', 'is_demo', 'status', 'delivery_fee_cdf', 'version'];

    protected function casts(): array
    {
        return ['is_public' => 'boolean', 'is_demo' => 'boolean', 'delivery_fee_cdf' => 'integer', 'version' => 'integer'];
    }

    public function contents()
    {
        return $this->hasMany(RestaurantContent::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('role', 'is_active', 'version')->withTimestamps();
    }

    public function categories() { return $this->hasMany(MenuCategory::class); }
    public function serviceSlots() { return $this->hasMany(ServiceSlot::class); }
    public function diningTables() { return $this->hasMany(DiningTable::class); }
    public function deliveryZones() { return $this->hasMany(DeliveryZone::class); }
}
