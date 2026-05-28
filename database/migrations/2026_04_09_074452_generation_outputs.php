<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Each generation can produce multiple output images (e.g. photos_requested = 3).
     * We store each image as a separate row here so they are individually addressable,
     * downloadable, and can be deleted without touching the parent generation record.
     */
    public function up(): void
    {
        Schema::create('generation_outputs', function (Blueprint $table) {
            $table->id();
 
            $table->foreignId('generation_id')
                  ->constrained('generations')
                  ->cascadeOnDelete();
 
            // Position in the batch (0-indexed)
            $table->tinyInteger('index')->default(0);
 
            // Original CDN URL returned by Replicate
            $table->text('replicate_url');
 
            // Locally stored copy (relative to storage/app/public)
            // Null until the file has been downloaded and saved
            $table->string('local_path')->nullable();
 
            // Public URL we serve to the browser
            // Populated once local_path is set
            $table->text('public_url')->nullable();
 
            // For Gemini text-response outputs (no image)
            $table->longText('text_output')->nullable();
 
            $table->enum('type', ['image', 'text'])->default('image');
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generation_outputs');
    }
};
