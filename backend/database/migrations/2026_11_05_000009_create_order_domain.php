<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('restaurants', fn (Blueprint $table) => $table->unsignedInteger('delivery_fee_cdf')->default(0));
        Schema::create('service_slots', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->string('service', 20);
            $table->unsignedTinyInteger('weekday'); // 0 dimanche à 6 samedi, heure de Kinshasa
            $table->time('starts_at');
            $table->time('ends_at');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->index(['restaurant_id', 'service', 'weekday', 'is_active']);
        });
        Schema::create('delivery_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label', 80);
            $table->string('address_line', 255);
            $table->string('district', 120);
            $table->string('city', 120)->default('Kinshasa');
            $table->string('phone', 30);
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->index('user_id');
        });
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
        });
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('content_id')->constrained('restaurant_contents')->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('menu_options')->nullOnDelete();
            $table->json('supplement_ids')->nullable();
            $table->unsignedSmallInteger('quantity');
            $table->timestamps();
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_slot_id')->nullable()->constrained('service_slots')->nullOnDelete();
            $table->foreignId('delivery_address_id')->nullable()->constrained('delivery_addresses')->nullOnDelete();
            $table->json('delivery_address_snapshot')->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->unsignedInteger('subtotal_cdf')->nullable();
            $table->unsignedInteger('delivery_fee_cdf')->default(0);
            $table->string('idempotency_key', 120)->nullable();
            $table->string('request_hash', 64)->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->unique(['user_id', 'idempotency_key']);
        });
        Schema::create('order_lines', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 80);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreignId('content_id')->nullable()->constrained('restaurant_contents')->nullOnDelete();
            $table->string('title_snapshot');
            $table->json('options_snapshot')->nullable();
            $table->unsignedSmallInteger('quantity');
            $table->unsignedInteger('unit_price_cdf');
            $table->unsignedInteger('line_total_cdf');
            $table->boolean('stock_reserved')->default(false);
            $table->timestamps();
        });
        Schema::create('order_events', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 80);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_status', 40)->nullable();
            $table->string('to_status', 40);
            $table->timestamp('created_at')->useCurrent();
            $table->index(['order_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_events');
        Schema::dropIfExists('order_lines');
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'idempotency_key']);
            $table->dropConstrainedForeignId('user_id');
            $table->dropConstrainedForeignId('service_slot_id');
            $table->dropConstrainedForeignId('delivery_address_id');
            $table->dropColumn(['delivery_address_snapshot', 'requested_at', 'subtotal_cdf', 'delivery_fee_cdf', 'idempotency_key', 'request_hash', 'version']);
        });
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('delivery_addresses');
        Schema::dropIfExists('service_slots');
        Schema::table('restaurants', fn (Blueprint $table) => $table->dropColumn('delivery_fee_cdf'));
    }
};
