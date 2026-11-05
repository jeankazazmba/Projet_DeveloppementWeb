<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    /** Tout compte nouvellement créé est actif jusqu’à une suspension explicite. */
    protected $attributes = ['is_active' => true, 'is_platform_admin' => false];

    protected $fillable = ['name', 'email', 'password', 'is_platform_admin', 'is_active'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'is_platform_admin' => 'boolean', 'is_active' => 'boolean'];
    }

    public function restaurants()
    {
        return $this->belongsToMany(Restaurant::class)->withPivot('role')->withTimestamps();
    }
}
