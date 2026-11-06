<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $attributes = ['version' => 1, 'escalated' => false, 'is_demo' => false];
    protected $fillable = ['id', 'restaurant_id', 'order_id', 'user_id', 'student_name', 'reason', 'status', 'escalated', 'version'];
    protected function casts(): array { return ['escalated' => 'boolean', 'version' => 'integer']; }
    public function messages() { return $this->hasMany(ComplaintMessage::class); }
    public function attachments() { return $this->hasMany(ComplaintAttachment::class); }
    public function events() { return $this->hasMany(ComplaintEvent::class); }
}
