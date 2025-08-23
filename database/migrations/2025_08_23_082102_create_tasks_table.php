<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manager_id')->constrained('users')->cascadeOnDelete();
            $table->string('task_name');
            $table->text('description')->nullable();
            $table->unsignedInteger('number_of_uploads');
            $table->boolean('is_active')->default(true); // manager can deactivate
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
