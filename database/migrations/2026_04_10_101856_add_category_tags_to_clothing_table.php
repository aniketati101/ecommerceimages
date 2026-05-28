<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clothing', function (Blueprint $table) {
            $table->string('category', 100)->nullable()->after('name');
            $table->string('tags', 500)->nullable()->after('back_description');
        });
    }

    public function down(): void
    {
        Schema::table('clothing', function (Blueprint $table) {
            $table->dropColumn(['category', 'tags']);
        });
    }
};