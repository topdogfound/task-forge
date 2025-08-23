<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\UserTask;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        $userTask = $user ? UserTask::where('task_id', $this->id)
            ->where('user_id', $user->id)
            ->first() : null;

        $inProgressByUser = $userTask && $userTask->status === 'in_progress' && !$userTask->isExpired();

        $inProgressByOtherUser = $user ? UserTask::where('task_id', $this->id)
            ->where('status', 'in_progress')
            ->where('user_id', '!=', $user->id)
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists() : false;

        return [
            'id' => $this->id,
            'name' => $this->task_name,
            'description' => $this->description,
            'number_of_uploads' => $this->number_of_uploads,
            'manager_id' => $this->manager_id,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user_task_id' => $userTask->id ?? null,


            'permissions' => [
                'can_start' => !$inProgressByUser && !$inProgressByOtherUser && $user->hasRole('user'),
                'can_complete' => $inProgressByUser,
            ],

            'in_progress' => $inProgressByOtherUser,
            'current_user_role' => $user ? $user->getRoleNames()->first() : null,
        ];
    }
}
