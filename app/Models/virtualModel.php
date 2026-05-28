<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VirtualModel extends Model
{
    protected $table = 'virtual_models';

    protected $fillable = [
        'user_id',
        'generate_id',
        'prompt',
        'model_image_path',
        'pose_image_path',
        'photo',
        'status',
        'error_message',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ─────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}

