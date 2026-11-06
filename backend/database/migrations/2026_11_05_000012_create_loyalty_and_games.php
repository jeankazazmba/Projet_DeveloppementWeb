<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('loyalty_rules', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->unsignedInteger('points_per_order');
            $table->unsignedInteger('referral_points')->default(0);
            $table->boolean('is_active')->default(false);
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();
            $table->text('validation_note')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->index(['restaurant_id', 'is_active']);
        });
        Schema::table('loyalty_movements', function (Blueprint $table) {
            $table->string('event_key', 160)->nullable();
            $table->string('order_id', 80)->nullable();
            $table->foreignId('loyalty_rule_id')->nullable()->constrained('loyalty_rules')->nullOnDelete();
            $table->unique(['restaurant_id', 'event_key']);
        });
        Schema::create('referral_codes', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('code', 32)->unique();
            $table->timestamps();
            $table->unique(['restaurant_id', 'user_id']);
        });
        Schema::table('referrals', function (Blueprint $table) {
            $table->foreignId('referral_code_id')->nullable()->constrained('referral_codes')->nullOnDelete();
            $table->timestamp('rewarded_at')->nullable();
            $table->unique(['restaurant_id', 'referee_id']);
        });
        Schema::create('game_participations', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->foreignId('game_content_id')->constrained('restaurant_contents')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['game_content_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_participations');
        Schema::table('referrals', function (Blueprint $table) {
            $table->dropUnique(['restaurant_id', 'referee_id']);
            $table->dropConstrainedForeignId('referral_code_id');
            $table->dropColumn('rewarded_at');
        });
        Schema::dropIfExists('referral_codes');
        Schema::table('loyalty_movements', function (Blueprint $table) {
            $table->dropUnique(['restaurant_id', 'event_key']);
            $table->dropConstrainedForeignId('loyalty_rule_id');
            $table->dropColumn(['event_key', 'order_id']);
        });
        Schema::dropIfExists('loyalty_rules');
    }
};
