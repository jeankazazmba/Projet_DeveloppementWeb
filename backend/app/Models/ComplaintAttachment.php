<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintAttachment extends Model
{
    public $timestamps = false;
    protected $fillable = ['complaint_id', 'uploaded_by', 'path', 'original_name', 'mime_type', 'size_bytes', 'visibility', 'created_at'];
    protected $hidden = ['path', 'uploaded_by'];
    public function complaint() { return $this->belongsTo(Complaint::class); }
}
