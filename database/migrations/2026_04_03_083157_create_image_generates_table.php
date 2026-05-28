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
        Schema::create('image_generates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
 
            // Prompt & settings
            $table->text('prompt');
            $table->text('enhanced_prompt')->nullable();
            $table->boolean('prompt_enhance')->default(true);
 
            // Replicate API config
            $table->string('model')->default('openai/gpt-image-1.5');
            $table->string('aspect_ratio')->default('1:1');
            $table->string('quality')->default('high');
            $table->string('output_format')->default('webp');
            $table->unsignedTinyInteger('output_compression')->default(90);
            $table->string('background')->default('auto');
            $table->string('moderation')->default('auto');
            $table->unsignedTinyInteger('number_of_images')->default(1);
 
            // Input reference images (uploaded by user)
            $table->json('input_image_paths')->nullable();
 
            // Output images from Replicate
            $table->json('output_image_urls')->nullable();
            $table->json('output_image_paths')->nullable();
 
            // Replicate metadata
            $table->string('replicate_prediction_id')->nullable()->index();
            $table->string('status')->default('pending'); // pending | processing | succeeded | failed
            $table->text('error_message')->nullable();
            $table->unsignedInteger('processing_time_ms')->nullable();
 
            $table->timestamps();
            $table->softDeletes();
 
            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('image_generates');
    }
};
