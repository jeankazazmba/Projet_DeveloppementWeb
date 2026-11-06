<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintEvent extends Model
{
    public $timestamps = false;
    protected $fillable = ['complaint_id', 'actor_id', 'from_status', 'to_status', 'reason', 'complaint_version', 'created_at'];
    protected $hidden = ['actor_id'];
}
