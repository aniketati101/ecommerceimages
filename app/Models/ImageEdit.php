<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ImageEdit extends Model
{
    use HasFactory;
 
    protected $fillable = [
        'user_id',
        'prompt',
        'aspect_ratio',
        'output_format',
        'item_image_path',
        'model_image_path',
        'item_image_url',
        'model_image_url',
        'output_image_path',
        'output_image_url',
        'replicate_prediction_id',
        'status',
        'error_message',
        'replicate_response',
    ];
 
    protected $casts = [
        'replicate_response' => 'array',
    ];
 
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
 
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
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