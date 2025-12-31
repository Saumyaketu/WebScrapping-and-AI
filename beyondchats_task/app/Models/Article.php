<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'url', 'original_content', 'updated_content', 'reference_links', 'is_processed'];
    
    protected $casts = [
        'reference_links' => 'array',
        'is_processed' => 'boolean'
    ];
}