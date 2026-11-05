<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    /** Tout compte nouvellement créé est actif jusqu’à une suspension explicite. */
    protected $attributes = ['is_active' => true, 'is_platform_admin' => false, 'version' => 1];

    protected $fillable = ['name', 'email', 'password', 'is_platform_admin', 'is_active', 'version'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'is_platform_admin' => 'boolean', 'is_active' => 'boolean', 'version' => 'integer'];
    }

    public function restaurants()
    {
        return $this->belongsToMany(Restaurant::class)->withPivot('role', 'is_active', 'version')->withTimestamps();
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }
}
