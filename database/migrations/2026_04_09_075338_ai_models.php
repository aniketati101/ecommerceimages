<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
 
return new class extends Migration
{
    /**
     * Stores the available AI model configurations.
     * Seeded with defaults so the app works out of the box.
     * Admins can add / deactivate models without a code deploy.
     */
    public function up(): void
    {
        Schema::create('ai_models', function (Blueprint $table) {
            $table->id();
            $table->string('key', 50)->unique();          // e.g. 'idm-vton'
            $table->string('label', 100);                  // e.g. 'IDM-VTON'
            $table->string('description')->nullable();
            $table->string('badge', 30)->nullable();       // e.g. 'RECOMMENDED'
            $table->enum('type', ['tryon', 'text2img', 'vision']);
            $table->boolean('requires_human_image')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
 
        // Seed default models
        DB::table('ai_models')->insert([
            [
                'key'                  => 'idm-vton',
                'label'                => 'IDM-VTON',
                'description'          => 'Best virtual try-on accuracy',
                'badge'                => 'RECOMMENDED',
                'type'                 => 'tryon',
                'requires_human_image' => true,
                'is_active'            => true,
                'sort_order'           => 1,
                'created_at'           => now(),
                'updated_at'           => now(),
            ],
            [
                'key'                  => 'seedream-4',
                'label'                => 'SeedDream 4',
                'description'          => 'High-resolution fashion photoshoot',
                'badge'                => 'NEW',
                'type'                 => 'text2img',
                'requires_human_image' => false,
                'is_active'            => true,
                'sort_order'           => 2,
                'created_at'           => now(),
                'updated_at'           => now(),
            ],
            [
                'key'                  => 'gemini-flash',
                'label'                => 'Gemini Flash 2.5',
                'description'          => 'AI-powered vision & styling analysis',
                'badge'                => 'FAST',
                'type'                 => 'vision',
                'requires_human_image' => false,
                'is_active'            => true,
                'sort_order'           => 3,
                'created_at'           => now(),
                'updated_at'           => now(),
            ],
        ]);
    }
 
    public function down(): void
    {
        Schema::dropIfExists('ai_models');
    }
};
