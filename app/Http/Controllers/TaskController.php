<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Resources\TaskResource;
use App\Http\Requests\StoreTaskRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;
use App\Models\UserTask;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $tasks = Task::query()
            ->when($user->role === 'manager', fn($query) => $query->where('created_by', $user->id))
            ->where('is_active', true)
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('Tasks/Index', [
            'tasks' => TaskResource::collection($tasks)
                ->additional(['current_user_role' => $user->getRoleNames()->first()]),

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Tasks/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request): RedirectResponse
    {
        // Validated and authorized via StoreTaskRequest
        $task = Task::create([
            'task_name' => $request->name,
            'description' => $request->description,
            'number_of_uploads' => $request->number_of_uploads,
            'manager_id' => $request->user()->id,
        ]);


        return redirect()->route('tasks.index')
            ->with('success', 'Task "' . $task->name . '" created successfully.');
    }
    /**
     * Start a task (for users with 'user' role)
     */
    public function start(Task $task, Request $request): RedirectResponse
    {
        $user = $request->user();

        // Check if the user has the 'user' role
        if (!$user || !$user->hasRole('user')) {
            abort(403, 'Unauthorized action.');
        }

        // Check if the task is active
        if (!$task->is_active) {
            return redirect()->route('tasks.index')
                ->with('error', 'This task is not active.');
        }

        // Check if user has already started this task
        $existingUserTask = UserTask::where('user_id', $user->id)
            ->where('task_id', $task->id)
            ->whereIn('status', ['in_progress', 'completed'])
            ->first();

        if ($existingUserTask) {
            return redirect()->route('tasks.index')
                ->with('error', 'You have already started this task.');
        }

        // Logic to start the task for the user
        UserTask::create([
            'user_id' => $user->id,
            'task_id' => $task->id,
            'status' => 'in_progress',
            'started_at' => now(),
            'expires_at' => now()->addDays(7), // Set expiration (adjust as needed)
        ]);

        return redirect()->route('tasks.index')
            ->with('success', 'You have started the task "' . $task->task_name . '".');
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        //
    }
}
