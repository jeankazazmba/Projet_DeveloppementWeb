<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrdersFlowTest extends TestCase
{
    use RefreshDatabase;

    private function student(string $email): User
    {
        $user = User::create(['name' => $email, 'email' => $email, 'password' => 'LongPassword!123']);
        $user->studentProfile()->create([]);
        return $user;
    }

    private function staff(Restaurant $restaurant, string $role): User
    {
        $user = User::create(['name' => $role, 'email' => uniqid($role).'@example.test', 'password' => 'LongPassword!123']);
        $user->restaurants()->attach($restaurant->id, ['role' => $role]);
        return $user;
    }

    private function fixture(): array
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true, 'delivery_fee_cdf' => 500]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $dish = $a->contents()->create(['kind' => 'dish', 'title' => 'Poulet', 'price_cdf' => 1000, 'stock_quantity' => 2, 'is_published' => true]);
        $otherDish = $b->contents()->create(['kind' => 'dish', 'title' => 'Autre', 'price_cdf' => 1000, 'stock_quantity' => 3, 'is_published' => true]);
        $variant = $dish->options()->create(['kind' => 'variant', 'name' => 'Grand', 'price_delta_cdf' => 200, 'stock_quantity' => 2]);
        $supplement = $dish->options()->create(['kind' => 'supplement', 'name' => 'Sauce', 'price_delta_cdf' => 100, 'stock_quantity' => 2]);
        $requested = Carbon::now('Africa/Kinshasa')->addDay()->setTime(12, 0);
        $slot = $a->serviceSlots()->create(['service' => 'delivery', 'weekday' => $requested->dayOfWeek, 'starts_at' => '11:00', 'ends_at' => '13:00']);
        $student = $this->student('student@example.test');
        $address = $this->postAddressFor($student);
        return compact('a', 'b', 'dish', 'otherDish', 'variant', 'supplement', 'requested', 'slot', 'student', 'address');
    }

    private function postAddressFor(User $user): int
    {
        Sanctum::actingAs($user);
        return $this->postJson('/api/me/delivery-addresses', ['label' => 'Campus', 'address_line' => 'Avenue A', 'district' => 'Gombe', 'city' => 'Kinshasa', 'phone' => '+243900000000'])->assertCreated()->json('id');
    }

    private function orderBody(array $f): array
    {
        return [
            'service' => 'delivery', 'requested_at' => $f['requested']->toIso8601String(),
            'service_slot_id' => $f['slot']->id, 'delivery_address_id' => $f['address'],
            'items' => [['content_id' => $f['dish']->id, 'quantity' => 2, 'variant_id' => $f['variant']->id, 'supplement_ids' => [$f['supplement']->id]]],
        ];
    }

    public function test_quote_order_idempotency_stock_snapshot_and_student_isolation(): void
    {
        $f = $this->fixture();
        Sanctum::actingAs($f['student']);
        $body = $this->orderBody($f);
        $this->postJson('/api/restaurants/a/quotes', $body)->assertOk()->assertJsonPath('subtotal_cdf', 2600)->assertJsonPath('delivery_fee_cdf', 500)->assertJsonPath('total_cdf', 3100);
        $created = $this->withHeader('Idempotency-Key', 'order-test-001')->postJson('/api/restaurants/a/orders', $body)->assertCreated()
            ->assertJsonPath('amount_cdf', 3100)->assertJsonPath('lines.0.unit_price_cdf', 1300)->assertJsonPath('status', 'received');
        $id = $created->json('id');
        $this->assertDatabaseHas('restaurant_contents', ['id' => $f['dish']->id, 'stock_quantity' => 0]);
        $this->assertDatabaseHas('menu_options', ['id' => $f['variant']->id, 'stock_quantity' => 0]);
        $this->withHeader('Idempotency-Key', 'order-test-001')->postJson('/api/restaurants/a/orders', $body)->assertOk()->assertJsonPath('id', $id);
        $this->withHeader('Idempotency-Key', 'order-test-001')->postJson('/api/restaurants/a/orders', [...$body, 'service' => 'pickup'])->assertStatus(409);
        $this->withHeader('Idempotency-Key', 'order-test-002')->postJson('/api/restaurants/a/orders', $body)->assertUnprocessable();
        $this->assertDatabaseCount('order_lines', 1);
        $this->getJson('/api/me/orders')->assertOk()->assertJsonPath('total', 1);
        $this->getJson("/api/me/orders/{$id}")->assertOk()->assertJsonPath('lines.0.title_snapshot', 'Poulet');
        Sanctum::actingAs($this->student('other@example.test'));
        $this->getJson("/api/me/orders/{$id}")->assertNotFound();
        $this->getJson('/api/me/orders')->assertOk()->assertJsonPath('total', 0);
        Sanctum::actingAs($this->staff($f['b'], 'employee'));
        $this->getJson('/api/staff/restaurants/a/orders')->assertNotFound();
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'accepted', 'expected_version' => 1])->assertNotFound();
        $platform = User::create(['name' => 'Platform', 'email' => 'platform@example.test', 'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);
        $this->getJson('/api/staff/restaurants/a/orders')->assertForbidden();
        $this->postJson('/api/restaurants/a/quotes', $body)->assertForbidden();
    }

    public function test_status_transitions_conflicts_and_cancellation_restore_stock(): void
    {
        $f = $this->fixture();
        Sanctum::actingAs($f['student']);
        $body = $this->orderBody($f);
        $id = $this->withHeader('Idempotency-Key', 'order-test-003')->postJson('/api/restaurants/a/orders', $body)->assertCreated()->json('id');
        Sanctum::actingAs($this->staff($f['a'], 'employee'));
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'ready', 'expected_version' => 1])->assertStatus(409);
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'accepted', 'expected_version' => 1])->assertOk()->assertJsonPath('version', 2);
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'preparing', 'expected_version' => 1])->assertStatus(409);
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'cancelled', 'reason' => 'Client absent', 'expected_version' => 2])->assertForbidden();
        Sanctum::actingAs($this->staff($f['a'], 'manager'));
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'cancelled', 'reason' => 'Client absent', 'expected_version' => 2])->assertOk()->assertJsonPath('version', 3);
        $this->assertDatabaseHas('restaurant_contents', ['id' => $f['dish']->id, 'stock_quantity' => 2]);
        $this->assertDatabaseHas('menu_options', ['id' => $f['supplement']->id, 'stock_quantity' => 2]);
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'accepted', 'expected_version' => 3])->assertStatus(409);
        $this->assertDatabaseCount('order_events', 3);
    }

    public function test_cart_requires_explicit_restaurant_replacement_and_quote_checks_schedule(): void
    {
        $f = $this->fixture();
        Sanctum::actingAs($f['student']);
        $cart = $this->putJson('/api/me/cart', ['restaurant_id' => 'a', 'items' => [['content_id' => $f['dish']->id, 'quantity' => 1]]])->assertOk();
        $this->putJson('/api/me/cart', ['restaurant_id' => 'a', 'expected_version' => $cart->json('version'), 'items' => [['content_id' => $f['dish']->id, 'quantity' => 1, 'variant_id' => 99999]]])->assertUnprocessable();
        $this->putJson('/api/me/cart', ['restaurant_id' => 'b', 'expected_version' => $cart->json('version'), 'items' => [['content_id' => $f['otherDish']->id, 'quantity' => 1]]])->assertStatus(409);
        $this->putJson('/api/me/cart', ['restaurant_id' => 'b', 'replace_restaurant' => true, 'expected_version' => $cart->json('version'), 'items' => [['content_id' => $f['otherDish']->id, 'quantity' => 1]]])->assertOk()->assertJsonPath('restaurant_id', 'b');
        $this->postJson('/api/restaurants/a/quotes', ['service' => 'delivery', 'requested_at' => $f['requested']->toIso8601String(), 'service_slot_id' => $f['slot']->id, 'delivery_address_id' => $f['address']])->assertUnprocessable();
        $this->postJson('/api/restaurants/a/quotes', [...$this->orderBody($f), 'items' => [['content_id' => $f['otherDish']->id, 'quantity' => 1]]])->assertUnprocessable();
        $this->postJson('/api/restaurants/a/quotes', [...$this->orderBody($f), 'requested_at' => $f['requested']->copy()->setTime(18, 0)->toIso8601String()])->assertUnprocessable();
    }
}
