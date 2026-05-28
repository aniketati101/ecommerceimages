<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class ImageGenerate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'prompt',
        'enhanced_prompt',
        'prompt_enhance',
        'model',
        'aspect_ratio',
        'quality',
        'output_format',
        'output_compression',
        'background',
        'moderation',
        'number_of_images',
        'input_image_paths',
        'output_image_urls',
        'output_image_paths',
        'replicate_prediction_id',
        'status',
        'error_message',
        'processing_time_ms',
    ];

    protected $casts = [
        'prompt_enhance'      => 'boolean',
        'input_image_paths'   => 'array',
        'output_image_urls'   => 'array',
        'output_image_paths'  => 'array',
        'output_compression'  => 'integer',
        'number_of_images'    => 'integer',
        'processing_time_ms'  => 'integer',
    ];

    // ── Relations ────────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeSucceeded($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ── Accessors ────────────────────────────────────────────────────────────

    /**
     * Returns public URLs for all locally-saved output images.
     */
    public function getOutputPublicUrlsAttribute(): array
    {
        if (empty($this->output_image_paths)) {
            return $this->output_image_urls ?? [];
        }

        return array_map(
            fn($path) => Storage::disk('public')->url($path),
            $this->output_image_paths
        );
    }

    /**
     * Returns public URLs for all input/reference images.
     */
    public function getInputPublicUrlsAttribute(): array
    {
        if (empty($this->input_image_paths)) {
            return [];
        }

        return array_map(
            fn($path) => Storage::disk('public')->url($path),
            $this->input_image_paths
        );
    }

    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }
}
