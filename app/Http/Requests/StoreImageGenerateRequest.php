<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreImageGenerateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Add gate/policy logic if needed
    }

    public function rules(): array
    {
        return [
            'prompt'             => ['required', 'string', 'min:3', 'max:2000'],
            'prompt_enhance'     => ['nullable', 'boolean'],
            'aspect_ratio'       => ['nullable', 'string', 'in:1:1,3:2,2:3,4:3,3:4,16:9,9:16'],
            'quality'            => ['nullable', 'string', 'in:low,medium,high,auto'],
            'output_format'      => ['nullable', 'string', 'in:webp,png,jpeg'],
            'output_compression' => ['nullable', 'integer', 'min:1', 'max:100'],
            'background'         => ['nullable', 'string', 'in:auto,transparent,opaque'],
            'number_of_images'   => ['nullable', 'integer', 'min:1', 'max:4'],
            'input_images'       => ['nullable', 'array', 'max:5'],
            'input_images.*'     => ['file', 'mimes:jpg,jpeg,png,webp,gif', 'max:10240'], // 10 MB each
        ];
    }

    public function messages(): array
    {
        return [
            'prompt.required'          => 'A prompt is required to generate images.',
            'input_images.*.mimes'     => 'Each reference image must be jpg, jpeg, png, webp, or gif.',
            'input_images.*.max'       => 'Each reference image may not exceed 10 MB.',
            'input_images.max'         => 'You may upload a maximum of 5 reference images.',
        ];
    }

    /**
     * Cast prompt_enhance to boolean properly from form-data "1"/"0" strings.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('prompt_enhance')) {
            $this->merge([
                'prompt_enhance' => filter_var($this->input('prompt_enhance'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
    
}