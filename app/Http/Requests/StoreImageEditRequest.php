<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreImageEditRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }
 
    public function rules(): array
    {
        return [
            'item_file'     => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'model_file'    => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'prompt'        => ['required', 'string', 'min:3', 'max:1000'],
            'aspect_ratio'  => ['nullable', 'string', 'in:match_input_image,1:1,4:3,3:4,16:9,9:16'],
            'output_format' => ['nullable', 'string', 'in:jpg,png,webp'],
        ];
    }
 
    public function messages(): array
    {
        return [
            'item_file.required'  => 'Please upload the clothing / item image.',
            'model_file.required' => 'Please upload the model image.',
            'prompt.required'     => 'A prompt describing the edit is required.',
        ];
    }
}
