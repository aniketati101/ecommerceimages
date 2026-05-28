<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GenerationOutput extends Model
{
    use HasFactory;

    protected $table = 'generation_outputs';

    protected $fillable = [
        'generation_id',
        'index',
        'replicate_url',
        'local_path',
        'public_url',
        'text_output',
        'type',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function generation(): BelongsTo
    {
        return $this->belongsTo(Generation::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }

    public function scopeTexts($query)
    {
        return $query->where('type', 'text');
    }
}