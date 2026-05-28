<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Generation extends Model
{
    use HasFactory;

    protected $table = 'generations';

    protected $fillable = [
        'user_id',
        'clothing_id',
        'ai_model',
        'clothing_image_path',
        'model_image_path',
        'prompt',
        'prompt_enhanced',
        'prompt_enhance_enabled',
        'camera_angle',
        'image_size',
        'photos_requested',
        'replicate_prediction_id',
        'status',
        'error_message',
    ];

    protected $casts = [
        'prompt_enhance_enabled' => 'boolean',
        'photos_requested'       => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clothing(): BelongsTo
    {
        return $this->belongsTo(Clothing::class);
    }

    public function outputs(): HasMany
    {
        return $this->hasMany(GenerationOutput::class)->orderBy('index');
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Convenience: the first completed image output URL (for list views).
     */
    public function getPrimaryImageAttribute(): ?string
    {
        return $this->outputs
            ->where('type', 'image')
            ->first()
            ?->public_url;
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}