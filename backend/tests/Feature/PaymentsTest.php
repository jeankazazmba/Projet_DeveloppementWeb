<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentsTest extends TestCase
{
    use RefreshDatabase;

    private function fixture(): array
    {
        $restaurant = Restaurant::create(['id' => 'r-payment', 'name' => 'Restaurant', 'status' => 'active', 'is_public' => true]);
        $student = User::create(['name' => 'Client', 'email' => 'payment@example.test', 'password' => 'LongPassword!123']);
        $student->studentProfile()->create([]);
        $order = Order::create(['id' => 'O-PAY-1', 'restaurant_id' => $restaurant->id, 'user_id' => $student->id,
            'customer_name' => 'Client', 'service' => 'pickup', 'status' => 'received', 'amount_cdf' => 5000]);
        return [$student, $order];
    }

    private function signedWebhook(array $body, bool $valid = true, ?int $timestamp = null)
    {
        $timestamp ??= now()->timestamp;
        $signature = hash_hmac('sha256', $timestamp.'.'.json_encode($body), config('payments.test_webhook_secret'));
        return $this->withHeaders(['X-Payment-Timestamp' => (string) $timestamp,
            'X-Payment-Signature' => 'sha256='.($valid ? $signature : str_repeat('0', 64))])->postJson('/api/webhooks/payments/test', $body);
    }

    public function test_cash_intent_is_due_and_is_idempotent_and_private(): void
    {
        [$student, $order] = $this->fixture();
        $this->postJson("/api/me/orders/{$order->id}/payment-intents", ['method' => 'cash'])->assertUnauthorized();
        Sanctum::actingAs($student);
        $this->getJson('/api/payment-methods')->assertOk()->assertJsonFragment(['code' => 'cash', 'available' => true])
            ->assertJsonFragment(['code' => 'visa', 'available' => false]);
        $created = $this->withHeader('Idempotency-Key', 'payment-test-001')
            ->postJson("/api/me/orders/{$order->id}/payment-intents", ['method' => 'cash'])
            ->assertCreated()->assertJsonPath('status', 'cash_due')->assertJsonPath('amount_cdf', 5000)
            ->assertJsonPath('currency', 'CDF');
        $id = $created->json('id');
        $this->withHeader('Idempotency-Key', 'payment-test-001')
            ->postJson("/api/me/orders/{$order->id}/payment-intents", ['method' => 'cash'])
            ->assertOk()->assertJsonPath('id', $id);
        $this->withHeader('Idempotency-Key', 'payment-test-001')
            ->postJson("/api/me/orders/{$order->id}/payment-intents", ['method' => 'visa'])->assertUnprocessable();
        $this->withHeader('Idempotency-Key', 'payment-test-002')
            ->postJson("/api/me/orders/{$order->id}/payment-intents", ['method' => 'cash'])->assertStatus(409);
        $this->assertDatabaseCount('payment_intents', 1);
        $this->assertDatabaseCount('payment_events', 1);
        $this->getJson("/api/me/orders/{$order->id}/payment-intents")->assertOk()->assertJsonPath('0.id', $id);

        $other = User::create(['name' => 'Autre', 'email' => 'other-payment@example.test', 'password' => 'LongPassword!123']);
        $other->studentProfile()->create([]);
        Sanctum::actingAs($other);
        $this->getJson("/api/me/orders/{$order->id}/payment-intents")->assertNotFound();
        $this->postJson("/api/me/payment-intents/{$id}/cancel", ['expected_version' => 1])->assertNotFound();
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform-payment@example.test',
            'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);
        $this->getJson("/api/me/orders/{$order->id}/payment-intents")->assertForbidden();
    }

    public function test_only_signed_webhook_can_mark_paid_and_replay_is_safe(): void
    {
        config()->set('payments.sandbox_enabled', true);
        config()->set('payments.test_webhook_secret', str_repeat('s', 32));
        [$student, $order] = $this->fixture();
        Sanctum::actingAs($student);
        $id = $this->withHeader('Idempotency-Key', 'payment-test-003')
            ->postJson("/api/me/orders/{$order->id}/payment-intents", ['method' => 'sandbox_test'])
            ->assertCreated()->assertJsonPath('status', 'pending')->json('id');
        $this->postJson("/api/me/payment-intents/{$id}/cancel", ['expected_version' => 2])->assertStatus(409);
        $body = ['event_id' => 'evt-payment-1', 'intent_id' => $id, 'status' => 'requires_action'];
        $this->signedWebhook($body, false)->assertUnauthorized();
        $this->signedWebhook($body, true, now()->subMinutes(10)->timestamp)->assertUnauthorized();
        $this->assertDatabaseHas('payment_intents', ['id' => $id, 'status' => 'pending']);
        $this->signedWebhook($body)->assertOk()->assertJsonPath('intent_status', 'requires_action');
        $this->signedWebhook($body)->assertOk()->assertJsonPath('status', 'duplicate');
        $this->signedWebhook([...$body, 'status' => 'failed'])->assertStatus(409);
        $this->signedWebhook(['event_id' => 'evt-payment-2', 'intent_id' => $id, 'status' => 'paid'])
            ->assertOk()->assertJsonPath('intent_status', 'paid');
        $this->signedWebhook(['event_id' => 'evt-payment-3', 'intent_id' => $id, 'status' => 'failed'])->assertStatus(409);
        $this->postJson("/api/me/payment-intents/{$id}/cancel", ['expected_version' => 3])->assertStatus(409);
        $this->assertDatabaseHas('payment_intents', ['id' => $id, 'status' => 'paid', 'version' => 3]);
        $this->assertDatabaseCount('payment_events', 3);
    }

    public function test_cancel_conflict_and_disabled_sandbox(): void
    {
        [$student, $order] = $this->fixture();
        Sanctum::actingAs($student);
        $this->withHeader('Idempotency-Key', 'payment-test-004')
            ->postJson("/api/me/orders/{$order->id}/payment-intents", ['method' => 'sandbox_test'])->assertUnprocessable();
        $id = $this->withHeader('Idempotency-Key', 'payment-test-005')
            ->postJson("/api/me/orders/{$order->id}/payment-intents", ['method' => 'cash'])->assertCreated()->json('id');
        $this->postJson("/api/me/payment-intents/{$id}/cancel", ['expected_version' => 2])->assertStatus(409);
        $this->postJson("/api/me/payment-intents/{$id}/cancel", ['expected_version' => 1])
            ->assertOk()->assertJsonPath('status', 'cancelled')->assertJsonPath('version', 2);
        $this->postJson("/api/me/payment-intents/{$id}/cancel", ['expected_version' => 2])->assertStatus(409);
        $this->postJson('/api/webhooks/payments/test', ['event_id' => 'x'])->assertNotFound();
    }
}
