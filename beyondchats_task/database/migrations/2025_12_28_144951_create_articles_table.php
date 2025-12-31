<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('url')->unique(); // Unique prevents duplicates
            $table->longText('original_content')->nullable();
            $table->longText('updated_content')->nullable();
            $table->json('reference_links')->nullable();
            $table->boolean('is_processed')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('articles');
    }
};