<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UpscaleImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'replicate_prediction_id',
        'status',
        'original_image_path',
        'original_image_url',
        'prompt',
        'scale_factor',
        'output_format',
        'creativity',
        'resemblance',
        'dynamic',
        'num_inference_steps',
        'output_url',
        'output_image_path',
        'error_message',
        'replicate_response',
    ];

    protected $casts = [
        'replicate_response' => 'array',
        'creativity'         => 'float',
        'resemblance'        => 'float',
        'dynamic'            => 'integer',
        'scale_factor'       => 'integer',
        'num_inference_steps'=> 'integer',
    ];

    // ── Relationships ──────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Accessors ────────

    /**
     * Return the public URL for the output image.
     * Prefers the locally stored copy, falls back to the Replicate CDN URL.
     */
    public function getOutputImageUrlAttribute(): ?string
    {
        if ($this->output_image_path) {
            return asset('storage/' . $this->output_image_path);
        }

        return $this->output_url;
    }

    /**
     * Return the public URL for the original / input image.
     */
    public function getOriginalImageDisplayUrlAttribute(): ?string
    {
        if ($this->original_image_path) {
            return asset('storage/' . $this->original_image_path);
        }

        return $this->original_image_url;
    }

    // ── Scopes ───────────

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSucceeded($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }
}
