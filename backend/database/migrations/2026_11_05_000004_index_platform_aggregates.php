<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', fn (Blueprint $table) => $table->index(['restaurant_id', 'created_at'], 'orders_restaurant_created_idx'));
        Schema::table('complaints', fn (Blueprint $table) => $table->index(['restaurant_id', 'escalated', 'created_at'], 'complaints_platform_idx'));
        Schema::table('loyalty_movements', fn (Blueprint $table) => $table->index(['restaurant_id', 'created_at'], 'loyalty_platform_idx'));
        Schema::table('referrals', fn (Blueprint $table) => $table->index(['restaurant_id', 'created_at'], 'referrals_platform_idx'));
    }

    public function down(): void
    {
        Schema::table('referrals', fn (Blueprint $table) => $table->dropIndex('referrals_platform_idx'));
        Schema::table('loyalty_movements', fn (Blueprint $table) => $table->dropIndex('loyalty_platform_idx'));
        Schema::table('complaints', fn (Blueprint $table) => $table->dropIndex('complaints_platform_idx'));
        Schema::table('orders', fn (Blueprint $table) => $table->dropIndex('orders_restaurant_created_idx'));
    }
};
