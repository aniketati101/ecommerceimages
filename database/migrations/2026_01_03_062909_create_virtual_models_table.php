<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('virtual_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('generate_id')->nullable();          // Replicate prediction ID
            $table->text('prompt');
            $table->string('model_image_path')->nullable();     // selected face path
            $table->string('pose_image_path')->nullable();      // selected pose path
            $table->string('photo')->nullable();                // output image URL / path
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('virtual_models');
    }
};