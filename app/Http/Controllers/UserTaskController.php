<?php

namespace App\Http\Controllers;

use App\Models\UserTask;
use Illuminate\Http\Request;
use App\Models\Upload;
use Illuminate\Support\Facades\Validator;

class UserTaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(UserTask $userTask)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UserTask $userTask)
    {
        //
    }



    /**
     * Complete a user task
     */
    public function complete(Request $request, UserTask $userTask)
    {
        $task = $userTask->task;

        // Validate required number of files
        $request->validate([
            'files'   => "required|array|size:{$task->number_of_uploads}",
            'files.*' => 'required|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        foreach ($request->file('files') as $file) {
            $filename = $userTask->id . '_' . time() . '_' . $file->getClientOriginalName();

            // Save with original filename
            $path = $file->storeAs("uploads/{$userTask->id}", $filename, 'public');

            Upload::create([
                'user_task_id' => $userTask->id,
                'file_path'    => $path,
            ]);
        }


        // Mark user task as completed
        $userTask->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return back()->with('success', 'Task completed successfully!');
    }


    public function update(Request $request, UserTask $userTask)
    {
        $task = $userTask->task;

        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:5120',
        ]);

        if (count($request->file('files')) !== $task->number_of_uploads) {
            return response()->json([
                'message' => "You must upload exactly {$task->number_of_uploads} file(s)."
            ], 422);
        }

        $uploadedPaths = [];
        foreach ($request->file('files') as $file) {
            $uploadedPaths[] = $file->store('user-task-uploads', 'public');
        }

        $userTask->status = 'completed';
        $userTask->completed_at = now();
        $userTask->uploaded_files = $uploadedPaths;
        $userTask->save();

        return response()->json([
            'message' => 'Task submitted successfully!',
            'user_task' => $userTask
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserTask $userTask)
    {
        //
    }
}
