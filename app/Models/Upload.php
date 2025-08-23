<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Upload extends Model
{
    protected $fillable = ['user_task_id', 'file_path'];
    public function userTask(): BelongsTo
    {
        return $this->belongsTo(UserTask::class);
    }
}
