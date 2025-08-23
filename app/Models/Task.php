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
    protected $casts = [
        'is_active' => 'boolean',
        'number_of_uploads' => 'integer',
    ];

/**
     * Get the user assignments for this task.
     */
    public function userTasks()
    {
        return $this->hasMany(UserTask::class);
    }

    /**
     * Get the users who have started this task.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_tasks')
                    ->withPivot(['status', 'started_at', 'expires_at', 'completed_at'])
                    ->withTimestamps();
    }

    /**
     * Get the manager who created this task.
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
}
