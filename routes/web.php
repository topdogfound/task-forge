<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserTaskController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect()->route('tasks.index');
    })->name('dashboard');

    Route::resource('tasks', TaskController::class)
        ->only(['index', 'create', 'store', 'show'])
        ->names([
            'index' => 'tasks.index',
            'create' => 'tasks.create',
            'store' => 'tasks.store',
            'show' => 'tasks.show',
        ]);
    Route::get('/tasks/{task}/start', [TaskController::class, 'start'])
        ->name('tasks.start');

    // Route::resource('user-tasks', UserTaskController::class)
    //     ->only(['store', 'update']);
    Route::post('/tasks/complete/{userTask}', [UserTaskController::class, 'complete'])
        ->name('tasks.complete');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
