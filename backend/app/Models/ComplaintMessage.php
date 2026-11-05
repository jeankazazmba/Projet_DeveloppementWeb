<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintMessage extends Model
{
    public $timestamps = false;
    protected $fillable = ['complaint_id', 'author_id', 'kind', 'visibility', 'body', 'created_at'];
    protected $hidden = ['author_id'];
}
