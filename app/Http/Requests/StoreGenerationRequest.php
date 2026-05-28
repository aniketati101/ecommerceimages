<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreGenerationRequest
 *
 * Centralises all validation rules for a new generation request.
 * Moves validation OUT of the controller entirely.
 */
class StoreGenerationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            // Clothing source — one of these must be present (checked in controller)
            'itum_file'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'existingitemid'       => 'nullable|string|max:500',
            'existing_clothing_id' => 'nullable|integer|exists:clothings,id',

            // Model/human image
            'model_file'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',

            // Generation settings
            'ai_model'             => 'nullable|string|in:idm-vton,seedream-4,gemini-flash',
            'prompt'               => 'nullable|string|max:2000',
            'promptEnhance'        => 'nullable|string|in:0,1',
            'photos_zoom'          => 'nullable|string|max:60',
            'photos_size'          => 'nullable|string|max:30',
            'photos'               => 'nullable|integer|min:1|max:5',
        ];
    }

    public function messages(): array
    {
        return [
            'itum_file.image'         => 'The clothing file must be an image.',
            'itum_file.max'           => 'The clothing image must not exceed 10 MB.',
            'model_file.image'        => 'The model file must be an image.',
            'model_file.max'          => 'The model image must not exceed 10 MB.',
            'ai_model.in'             => 'Please select a valid AI model.',
            'photos.max'              => 'You can generate a maximum of 5 photos at once.',
        ];
    }
}