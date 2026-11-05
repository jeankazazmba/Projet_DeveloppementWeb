<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('label', 100);
            $table->string('provider', 40);
            $table->boolean('is_enabled')->default(false);
            $table->timestamps();
        });
        $now = now();
        DB::table('payment_methods')->insert(array_map(fn ($method) => [
            'code' => $method[0], 'label' => $method[1], 'provider' => $method[2],
            'is_enabled' => $method[0] === 'cash', 'created_at' => $now, 'updated_at' => $now,
        ], [
            ['cash', 'Espèces à régler', 'cash'],
            ['sandbox_test', 'Paiement test local', 'sandbox_stub'],
            ['visa', 'Visa', 'unconfigured'], ['mastercard', 'Mastercard', 'unconfigured'],
            ['airtel_money', 'Airtel Money', 'unconfigured'], ['m_pesa', 'M-Pesa', 'unconfigured'],
            ['btc', 'Bitcoin', 'unconfigured'], ['eth', 'Ethereum', 'unconfigured'],
        ]));
        Schema::create('payment_intents', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('order_id', 80);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->string('restaurant_id');
            $table->foreign('restaurant_id')->references('id')->on('restaurants');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('payment_method_id')->constrained('payment_methods');
            $table->string('provider', 40);
            $table->string('status', 30);
            $table->unsignedInteger('amount_cdf');
            $table->string('currency', 3)->default('CDF');
            $table->string('idempotency_key', 120);
            $table->string('request_hash', 64);
            $table->string('external_reference', 160)->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->unique(['user_id', 'idempotency_key']);
            $table->index(['order_id', 'status']);
        });
        Schema::create('payment_events', function (Blueprint $table) {
            $table->id();
            $table->string('payment_intent_id', 80);
            $table->foreign('payment_intent_id')->references('id')->on('payment_intents')->cascadeOnDelete();
            $table->string('provider', 40);
            $table->string('event_id', 160);
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->string('payload_hash', 64);
            $table->unsignedInteger('intent_version');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['provider', 'event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_events');
        Schema::dropIfExists('payment_intents');
        Schema::dropIfExists('payment_methods');
    }
};
