<?php

namespace App\Http\Controllers;

use App\Models\UserTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

        // Validate request
        $request->validate([
            'files'   => 'required|array|min:1',
            'files.*' => 'file|max:5120', // 5MB max per file
        ]);

        $files = $request->file('files');

        // Ensure we have files and they're not null
        if (!$files || !is_array($files)) {
            return back()->withErrors([
                'files' => ['No files were uploaded.']
            ]);
        }

        // Filter out any null values from the files array
        $files = array_filter($files, function ($file) {
            return $file !== null && $file->isValid();
        });

        // Enforce exact number of uploads
        if (count($files) !== $task->number_of_uploads) {
            return back()->withErrors([
                'files' => ["You must upload exactly {$task->number_of_uploads} file(s). You uploaded " . count($files) . " file(s)."]
            ]);
        }

        // Store files with better error handling
        $uploadedPaths = [];

        try {
            foreach ($files as $index => $file) {
                if (!$file || !$file->isValid()) {
                    return back()->withErrors([
                        "files.{$index}" => 'The uploaded file is invalid.'
                    ]);
                }

                // Check file size before storing
                if ($file->getSize() > 5120 * 1024) { // 5MB in bytes
                    return back()->withErrors([
                        "files.{$index}" => 'The file is too large. Maximum size is 5MB.'
                    ]);
                }

                // Try to store the file with a custom name
                $fileName = time() . '_' . $index . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('user-task-uploads', $fileName, 'public');

                if (!$path) {
                    return back()->withErrors([
                        "files.{$index}" => 'Failed to upload the file. Please check server permissions.'
                    ]);
                }

                $uploadedPaths[] = $path;
            }
        } catch (\Exception $e) {
            return back()->withErrors([
                'files' => 'An error occurred while uploading files. Please try again.'
            ]);
        }

        // Update task
        $userTask->update([
            'status'         => 'completed',
            'completed_at'   => now(),
            'uploaded_files' => $uploadedPaths, // assuming JSON column
        ]);

        return redirect()->route('tasks.index')
            ->with('success', "Task submitted successfully: {$task->name}");
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
