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
        Schema::create('image_edits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('prompt');
            $table->string('aspect_ratio')->default('match_input_image');
            $table->string('output_format')->default('jpg');
            $table->string('item_image_path')->nullable();    // clothing/item image
            $table->string('model_image_path')->nullable();   // model image
            $table->string('item_image_url')->nullable();     // uploaded URL for API
            $table->string('model_image_url')->nullable();    // uploaded URL for API
            $table->string('output_image_path')->nullable();  // generated result path
            $table->string('output_image_url')->nullable();   // generated result URL
            $table->string('replicate_prediction_id')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->json('replicate_response')->nullable();
            $table->timestamps();
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('image_edits');
    }
};
