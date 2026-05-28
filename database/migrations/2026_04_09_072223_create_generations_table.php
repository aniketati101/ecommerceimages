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
        Schema::create('generations', function (Blueprint $table) {
            $table->id();
 
            // Owner
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();
 
            // Optional link to a saved clothing item
            $table->foreignId('clothing_id')
                  ->nullable()
                  ->constrained('clothings')
                  ->nullOnDelete();
 
            // Which Replicate model was used
            $table->string('ai_model', 50)->default('idm-vton');
            // e.g. 'idm-vton' | 'seedream-4' | 'gemini-flash'
 
            // Stored paths of the two uploaded source images (relative to storage/app/public)
            $table->string('clothing_image_path')->nullable();
            $table->string('model_image_path')->nullable();
 
            // Prompt & enhancements
            $table->text('prompt');
            $table->text('prompt_enhanced')->nullable();
            $table->boolean('prompt_enhance_enabled')->default(true);
 
            // Generation settings
            $table->string('camera_angle', 60)->nullable();
            $table->string('image_size', 30)->nullable();
            $table->tinyInteger('photos_requested')->default(1);
 
            // Replicate prediction tracking
            $table->string('replicate_prediction_id', 100)->nullable()->index();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])
                  ->default('pending')
                  ->index();
            $table->text('error_message')->nullable();
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generations');
    }
};
