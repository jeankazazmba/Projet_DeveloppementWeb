<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = ['name', 'email', 'password', 'is_platform_admin'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'is_platform_admin' => 'boolean'];
    }

    public function restaurants()
    {
        return $this->belongsToMany(Restaurant::class)->withPivot('role')->withTimestamps();
    }
}
