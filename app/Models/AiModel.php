<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiModel extends Model
{
    protected $table = 'ai_models';

    protected $fillable = [
        'key',
        'label',
        'description',
        'badge',
        'type',
        'requires_human_image',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'requires_human_image' => 'boolean',
        'is_active'            => 'boolean',
        'sort_order'           => 'integer',
    ];

    // ── Scopes ─────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}