<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UpscaleImageController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//Route::get(uri:'api/clothing', action:[\App\Http\Controllers\Auth\ClothingController::class, 'index']);

Route::middleware('auth')->prefix('upscale')->group(function () {
    Route::get('/',         [UpscaleImageController::class, 'history']);
    Route::post('/',        [UpscaleImageController::class, 'store']);
    Route::get('/{job}',    [UpscaleImageController::class, 'show']);
    Route::delete('/{job}', [UpscaleImageController::class, 'destroy']);
});
