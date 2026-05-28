<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Videos extends Model
{
    use HasFactory;
 
    protected $fillable = [
        'user_id',
        'prediction_id',
        'replicate_model',
        'title',
        'prompt',
        'negative_prompt',
        'duration',
        'aspect_ratio',
        'start_image_path',
        'end_image_path',
        'video_sound',
        'output_url',
        'local_video_path',
        'thumbnail_url',
        'file_size',
        'status',
        'error_message',
        'replicate_response',
        'generation_started_at',
        'generation_finished_at',
    ];
 
    protected $casts = [
        'video_sound'             => 'boolean',
        'replicate_response'      => 'array',
        'generation_started_at'   => 'datetime',
        'generation_finished_at'  => 'datetime',
        'file_size'               => 'integer',
    ];
 
    // ─── Relationships ────────────────────────────────────────────────────────
 
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
 
    // ─── Status helpers ───────────────────────────────────────────────────────
 
    public function isPending(): bool    { return $this->status === 'pending'; }
    public function isProcessing(): bool { return $this->status === 'processing'; }
    public function isDownloading(): bool{ return $this->status === 'downloading'; }
    public function isSucceeded(): bool  { return $this->status === 'succeeded'; }
    public function isFailed(): bool     { return $this->status === 'failed'; }
    public function isActive(): bool     { return in_array($this->status, ['pending', 'processing', 'downloading']); }
 
    // ─── URL helpers ──────────────────────────────────────────────────────────
 
    /**
     * Returns the best available video URL:
     * local file first (permanent), then original Replicate CDN URL (may expire).
     */
    public function videoUrl(): ?string
    {
        if ($this->local_video_path) {
            return Storage::disk('public')->url($this->local_video_path);
        }
        return $this->output_url;
    }
 
    public function startImageUrl(): ?string
    {
        return $this->start_image_path
            ? Storage::disk('public')->url($this->start_image_path)
            : null;
    }
 
    public function endImageUrl(): ?string
    {
        return $this->end_image_path
            ? Storage::disk('public')->url($this->end_image_path)
            : null;
    }
 
    /**
     * Human-readable file size.
     */
    public function fileSizeHuman(): ?string
    {
        if (!$this->file_size) return null;
        $bytes = $this->file_size;
        if ($bytes >= 1_073_741_824) return round($bytes / 1_073_741_824, 2) . ' GB';
        if ($bytes >= 1_048_576)     return round($bytes / 1_048_576, 2)     . ' MB';
        if ($bytes >= 1_024)         return round($bytes / 1_024, 2)         . ' KB';
        return $bytes . ' B';
    }
 
    /**
     * Generation duration in seconds.
     */
    public function generationDurationSeconds(): ?int
    {
        if (!$this->generation_started_at || !$this->generation_finished_at) return null;
        return (int) $this->generation_started_at->diffInSeconds($this->generation_finished_at);
    }
}