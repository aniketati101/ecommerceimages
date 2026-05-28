<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VirtualModelSamples extends Model
{
    protected $table = 'virtual_model_samples';

    protected $fillable = [
        'model_image',
        'poses',
    ];

    protected $casts = [
        'poses' => 'integer',
    ];

    // ─────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────

    /**
     * Face / identity reference images (poses = 1)
     */
    public function scopeFaces($query)
    {
        return $query->where('poses', 1);
    }

    /**
     * Pose reference images (poses != 1)
     */
    public function scopePoses($query)
    {
        return $query->where('poses', '!=', 1);
    }
}
