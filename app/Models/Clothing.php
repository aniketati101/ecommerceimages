<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clothing extends Model
{
    use HasFactory;

    // Allow mass assignment for these fields

    protected $fillable = [
        'user_id',
        'name',
        'category',
        'description',
        'back_description',
        'tags',
        'front_image',
        'back_image',
        'status',
        'created_at',
        'updated_at',  
    ];

}
