<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserTask extends Model
{
    protected $fillable = [
        'task_id', 
        'user_id', 
        'status', 
        'started_at', 
        'expires_at', 
        'completed_at'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function uploads(): HasMany
    {
        return $this->hasMany(Upload::class);
    }

    public function isExpired(): bool
    {
        return $this->status === 'in_progress' && $this->expires_at && $this->expires_at->isPast();
    }
}
