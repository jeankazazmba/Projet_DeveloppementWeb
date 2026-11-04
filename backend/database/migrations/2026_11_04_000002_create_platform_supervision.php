<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->boolean('is_active')->default(true));
        Schema::table('restaurants', fn (Blueprint $table) => $table->string('status', 20)->default('draft')->index());
        DB::table('restaurants')->where('is_public', true)->update(['status' => 'active']);

        Schema::create('platform_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('restaurant_id')->nullable()->index();
            $table->string('action', 80);
            $table->string('target_type', 80);
            $table->string('target_id', 120);
            $table->text('reason')->nullable();
            $table->json('changes')->nullable();
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('restaurant_id')->index();
            $table->foreign('restaurant_id')->references('id')->on('restaurants');
            $table->string('customer_name');
            $table->string('service', 30);
            $table->string('status', 40)->index();
            $table->unsignedInteger('amount_cdf');
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
        });

        Schema::create('complaints', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('restaurant_id')->index();
            $table->foreign('restaurant_id')->references('id')->on('restaurants');
            $table->string('order_id', 80)->nullable();
            $table->string('student_name');
            $table->string('reason');
            $table->string('status', 40)->index();
            $table->boolean('escalated')->default(false)->index();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
        });

        Schema::create('loyalty_movements', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id')->index();
            $table->foreign('restaurant_id')->references('id')->on('restaurants');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('points');
            $table->string('reason');
            $table->string('reference')->nullable();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
        });

        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id')->index();
            $table->foreign('restaurant_id')->references('id')->on('restaurants');
            $table->foreignId('referrer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('referee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 40);
            $table->unsignedInteger('rewarded_points')->default(0);
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('loyalty_movements');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('platform_audit_logs');
        Schema::table('restaurants', fn (Blueprint $table) => $table->dropColumn('status'));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('is_active'));
    }
};
