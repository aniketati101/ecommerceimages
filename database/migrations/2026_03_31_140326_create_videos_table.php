<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
 
            // ── Replicate tracking ───────
            
            $table->string('prediction_id')->nullable()->index();
            $table->string('replicate_model')->default('kwaivgi/kling-v2.5-turbo-pro');
 
            // ── Input parameters ─────

            $table->string('title')->nullable();
            $table->text('prompt');
            $table->string('negative_prompt')->nullable();
            $table->enum('duration', ['5', '10'])->default('5');
            $table->enum('aspect_ratio', ['16:9', '9:16', '1:1'])->default('16:9');
            $table->string('start_image_path')->nullable();
            $table->string('end_image_path')->nullable();
            $table->boolean('video_sound')->default(false);
 
            // ── Output / storage ─────

            $table->string('output_url')->nullable();          // original Replicate CDN URL
            $table->string('local_video_path')->nullable();    // downloaded & stored locally
            $table->string('thumbnail_url')->nullable();
            $table->unsignedBigInteger('file_size')->nullable(); // bytes
 
            // ── Status lifecycle ─────

            $table->enum('status', [
                'pending',
                'processing',
                'downloading',
                'succeeded',
                'failed',
                'canceled',
            ])->default('pending')->index();
 
            $table->text('error_message')->nullable();
            $table->json('replicate_response')->nullable();
 
            // ── Timing ────

            $table->timestamp('generation_started_at')->nullable();
            $table->timestamp('generation_finished_at')->nullable();
 
            $table->timestamps();
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};