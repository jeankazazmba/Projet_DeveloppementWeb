<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('menu_categories', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->index(['restaurant_id', 'is_active', 'sort_order']);
        });
        Schema::table('restaurant_contents', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('menu_categories')->nullOnDelete();
            $table->unsignedInteger('stock_quantity')->nullable();
            $table->timestamp('published_from')->nullable();
            $table->timestamp('published_until')->nullable();
            $table->index(['restaurant_id', 'is_published', 'published_from', 'published_until'], 'contents_publication_idx');
        });
        Schema::create('menu_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_id')->constrained('restaurant_contents')->cascadeOnDelete();
            $table->string('kind', 20); // variant ou supplement
            $table->string('name');
            $table->unsignedInteger('price_delta_cdf')->default(0);
            $table->boolean('is_available')->default(true);
            $table->unsignedInteger('stock_quantity')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->index(['content_id', 'kind', 'is_available']);
        });
        Schema::create('menu_allergens', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->string('name', 100);
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->unique(['restaurant_id', 'name']);
        });
        Schema::create('content_allergen', function (Blueprint $table) {
            $table->foreignId('content_id')->constrained('restaurant_contents')->cascadeOnDelete();
            $table->foreignId('allergen_id')->constrained('menu_allergens')->cascadeOnDelete();
            $table->primary(['content_id', 'allergen_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_allergen');
        Schema::dropIfExists('menu_allergens');
        Schema::dropIfExists('menu_options');
        Schema::table('restaurant_contents', function (Blueprint $table) {
            $table->dropIndex('contents_publication_idx');
            $table->dropConstrainedForeignId('category_id');
            $table->dropColumn(['stock_quantity', 'published_from', 'published_until']);
        });
        Schema::dropIfExists('menu_categories');
    }
};
