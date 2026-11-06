<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->boolean('is_platform_admin')->default(false);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('restaurants', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('location')->nullable();
            $table->string('hours')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
        });

        Schema::create('restaurant_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->enum('role', ['admin', 'manager', 'employee']);
            $table->timestamps();
            $table->unique(['user_id', 'restaurant_id']);
        });

        Schema::create('restaurant_contents', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->enum('kind', ['dish', 'promotion', 'event', 'game']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('price_cdf')->nullable();
            $table->string('image_url')->nullable();
            $table->json('details')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->index(['restaurant_id', 'kind', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_contents');
        Schema::dropIfExists('restaurant_user');
        Schema::dropIfExists('restaurants');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('users');
    }
};
