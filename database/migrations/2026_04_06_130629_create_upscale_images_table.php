<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    

    public function up(): void
    {
        Schema::create('upscale_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('replicate_prediction_id')->nullable()->index();
            $table->string('status')->default('pending'); // pending, processing, succeeded, failed
            $table->string('original_image_path')->nullable();
            $table->string('original_image_url')->nullable();
            $table->text('prompt')->nullable();
            $table->integer('scale_factor')->default(2);
            $table->string('output_format')->default('png');
            $table->float('creativity')->default(0.35);
            $table->float('resemblance')->default(0.6);
            $table->integer('dynamic')->default(6);
            $table->integer('num_inference_steps')->default(18);
            $table->text('output_url')->nullable();       // Replicate result URL
            $table->string('output_image_path')->nullable(); // locally saved copy
            $table->text('error_message')->nullable();
            $table->json('replicate_response')->nullable();
            $table->timestamps();
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('upscale_images');
    }
    
};
