<?php

use App\Http\Controllers\GenerationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Generation Routes
|--------------------------------------------------------------------------
| Add these routes inside your existing auth middleware group.
| Example:
|
|   Route::middleware(['auth', 'verified'])->group(function () {
|       // ... existing routes ...
|       require __DIR__ . '/generation.php';
|   });
|
*/

Route::prefix('dashboard')->name('dashboard.')->group(function () {

    // ── Generation wizard (create / show) ────
    
    Route::get('/generates', [GenerationController::class, 'index'])->name('generates.index');

    // Show pre-filled with a clothing item

    Route::get('/generates/{id}', [GenerationController::class, 'show'] )->name('generates.show');

    // Run the generation

    Route::post('/generates/store', [GenerationController::class, 'store'])->name('generates.store');

    // ── History ────

    Route::get('/generations', [GenerationController::class, 'generations'])->name('generates.generations');

    // Detail page for a single generation

    Route::get('/generations/{id}', [GenerationController::class, 'generationDetail'])->name('generates.detail');

    // ── Edit / Update ────
    
    Route::get('/generates/{id}/edit', [GenerationController::class, 'edit'])->name('generates.edit');

    Route::post('/generates/{id}/update', [GenerationController::class, 'update'])->name('generates.update');

    // ── Delete a single output image ─────

    Route::delete('/generations/{generationId}/outputs/{outputId}', [GenerationController::class, 'destroyOutput'])->name('generates.output.destroy');
});