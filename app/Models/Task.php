<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\UserTask;

class Task extends Model
{
    protected $fillable = [
        'manager_id', 
        'task_name', 
        'description', 
        'number_of_uploads', 
        'is_active'
    ];

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
    
    public function userTasks(): HasMany
    {
        return $this->hasMany(UserTask::class);
    }

    // Active if no current non-expired in_progress reservation
    public function scopeAvailable($q)
    {
        return $q->where('is_active', true)->whereDoesntHave('userTasks', function ($qq) {
            $qq->where('status', 'in_progress')->where('expires_at', '>', now());
        });
    }
}
