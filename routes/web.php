<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ClothingController;
use App\Http\Controllers\GenerateController;
use App\Http\Controllers\VirtualModelController;
use App\Http\Controllers\VideosController;
use App\Http\Controllers\ImageGenerateController;
use App\Http\Controllers\UpscaleImageController;
use App\Http\Controllers\ImageEditController;

Route::get('/', fn() => Inertia::render('Welcome'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    // Clothing
    Route::get('/dashboard/clothing',          [ClothingController::class, 'index'])->name('dashboard.clothing.index');
    Route::post('/dashboard/clothing/create',  [ClothingController::class, 'create'])->name('dashboard.clothing.create');
    Route::get('/dashboard/clothing/edit/{id}',[ClothingController::class, 'edit'])->name('dashboard.clothing.edit');
    Route::post('/dashboard/clothing/{id}',    [ClothingController::class, 'update'])->name('dashboard.clothing.update');
    Route::delete('/dashboard/clothing/{id}',  [ClothingController::class, 'destroy'])->name('dashboard.clothing.destroy'); 
    
    // Virtual Models
    Route::get('/dashboard/virtual-models',        [VirtualModelController::class, 'index'])->name('dashboard.virtual-models.index');
    Route::post('/dashboard/virtual-models/create', [VirtualModelController::class, 'create'])->name('dashboard.virtual-models.create');
    Route::delete('/dashboard/virtual-models/{virtualModel}', [VirtualModelController::class, 'destroy'])->name('dashboard.virtual-models.destroy');


    // Image Edits
    Route::get('/dashboard/edit-image', [ImageEditController::class, 'edit'])->name('dashboard.edit-image.index');
    Route::post('/dashboard/edit-image',         [ImageEditController::class, 'store'])->name('dashboard.edit-image.store');
    Route::get('/dashboard/edits',         [ImageEditController::class, 'index'])->name('dashboard.edit.index');
    Route::get('/dashboard/edits/{imageEdit}',         [ImageEditController::class, 'show'])->name('dashboard.edit.show');
    Route::post('/dashboard/edits/{imageEdit}/poll',   [ImageEditController::class, 'poll'])->name('dashboard.edit.poll');
    Route::delete('/dashboard/edits/{imageEdit}',      [ImageEditController::class, 'destroy'])->name('dashboard.edit.destroy');
    


    // Upscale Images
    Route::get('/dashboard/upscale-image', [UpscaleImageController::class, 'index'])->name('dashboard.upscale-image.index');

    Route::middleware(['auth'])->group(function () {
        Route::prefix('api/upscale')->group(function () {
            Route::get('/',         [UpscaleImageController::class, 'history']);
            Route::post('/',        [UpscaleImageController::class, 'store']);
            Route::get('/{job}',    [UpscaleImageController::class, 'show']);
            Route::delete('/{job}', [UpscaleImageController::class, 'destroy']);
        });
    });
    
    // videos — FIX: give the {id} route a distinct name

    Route::get('/dashboard/videos', [VideosController::class, 'index'])->name('dashboard.videos.index');
    Route::get('/dashboard/videos/{id}',     [VideosController::class, 'show'])->name('dashboard.videos.show');
    Route::post('/dashboard/videos/create',   [VideosController::class, 'create'])->name('dashboard.videos.create');
    Route::get('/dashboard/videos/edit/{id}', [VideosController::class, 'edit'])->name('dashboard.videos.edit');
    Route::put('/dashboard/videos/{id}',     [VideosController::class, 'update'])->name('dashboard.videos.update');
    Route::delete('/dashboard/videos/{id}',   [VideosController::class, 'destroy'])->name('dashboard.videos.destroy');
    
    // Polling endpoint (GET, returns JSON)
    Route::get('/dashboard/videos/{id}/poll', [VideosController::class, 'pollStatus'])->name('dashboard.videos.poll');

    // gpt images — FIX: give the {id} route a distinct name

    Route::get('/dashboard/image-generate',           [ImageGenerateController::class, 'index'])->name('dashboard.image-generate.index');
    Route::post('/dashboard/image-generate/store',    [ImageGenerateController::class, 'store'])->name('dashboard.image-generate.store');
    Route::get('/dashboard/image-generate/{id}',      [ImageGenerateController::class, 'show'])->name('dashboard.image-generate.show');
    Route::get('/dashboard/image-generate/edit/{id}', [ImageGenerateController::class, 'edit'])->name('dashboard.image-generate.edit');
    Route::put('/dashboard/image-generate/{id}',      [ImageGenerateController::class, 'update'])->name('dashboard.image-generate.update');
    Route::delete('/dashboard/image-generate/{id}',   [ImageGenerateController::class, 'destroy'])->name('dashboard.image-generate.destroy');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/generation.php';