<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RestaurantOperationsTest extends TestCase
{
    use RefreshDatabase;

    private function actor(Restaurant $restaurant, string $role): User
    {
        $user = User::create(['name' => $role, 'email' => uniqid($role).'@example.test', 'password' => 'LongPassword!123']);
        $user->restaurants()->attach($restaurant->id, ['role' => $role]);
        return $user;
    }

    private function student(): User
    {
        $user = User::create(['name' => 'Étudiant', 'email' => uniqid().'@example.test', 'password' => 'LongPassword!123']);
        $user->studentProfile()->create([]);
        return $user;
    }

    public function test_delivery_zone_assignment_positions_and_address_privacy(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true, 'delivery_fee_cdf' => 500]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $dish = $a->contents()->create(['kind' => 'dish', 'title' => 'Plat', 'price_cdf' => 1000, 'is_published' => true]);
        $requested = Carbon::now('Africa/Kinshasa')->addDay()->setTime(12, 0);
        $slot = $a->serviceSlots()->create(['service' => 'delivery', 'weekday' => $requested->dayOfWeek, 'starts_at' => '11:00', 'ends_at' => '13:00']);
        $admin = $this->actor($a, 'admin'); $manager = $this->actor($a, 'manager');
        $assigned = $this->actor($a, 'employee'); $otherEmployee = $this->actor($a, 'employee');
        $foreign = $this->actor($b, 'employee');
        Sanctum::actingAs($admin);
        $zone = $this->postJson('/api/staff/restaurants/a/delivery-zones', ['district' => 'Gombe', 'fee_cdf' => 900])->assertCreated()->json('id');
        $this->postJson('/api/staff/restaurants/b/delivery-zones', ['district' => 'Gombe', 'fee_cdf' => 1])->assertNotFound();
        Sanctum::actingAs($this->student());
        $address = $this->postJson('/api/me/delivery-addresses', ['label' => 'Campus', 'address_line' => 'Avenue privée 42', 'district' => 'Gombe', 'phone' => '+243900000000'])->assertCreated()->json('id');
        $body = ['service' => 'delivery', 'requested_at' => $requested->toIso8601String(), 'service_slot_id' => $slot->id, 'delivery_address_id' => $address,
            'items' => [['content_id' => $dish->id, 'quantity' => 1]]];
        $this->postJson('/api/restaurants/a/quotes', $body)->assertOk()->assertJsonPath('delivery_fee_cdf', 900)->assertJsonPath('delivery_zone_id', $zone);
        $order = $this->withHeader('Idempotency-Key', 'delivery-flow-001')->postJson('/api/restaurants/a/orders', $body)->assertCreated()->assertJsonPath('status', 'received');
        $id = $order->json('id');
        $student = User::findOrFail($order->json('user_id'));
        Sanctum::actingAs($otherEmployee);
        $this->getJson('/api/staff/restaurants/a/orders')->assertOk()->assertJsonPath('data.0.delivery_address', null)->assertDontSee('Avenue privée 42');
        $this->getJson("/api/staff/restaurants/a/orders/{$id}")->assertOk()->assertJsonPath('delivery_address', null);
        $this->postJson("/api/staff/orders/{$id}/delivery-position", ['latitude' => -4.3, 'longitude' => 15.3])->assertNotFound();
        Sanctum::actingAs($foreign);
        $this->getJson("/api/staff/restaurants/a/orders/{$id}")->assertNotFound();
        Sanctum::actingAs($manager);
        $this->putJson("/api/staff/orders/{$id}/delivery-assignment", ['employee_id' => $foreign->id, 'expected_version' => 1])->assertUnprocessable();
        $this->putJson("/api/staff/orders/{$id}/delivery-assignment", ['employee_id' => $assigned->id, 'expected_version' => 1])->assertOk()->assertJsonPath('version', 2)->assertJsonPath('delivery_address.address_line', 'Avenue privée 42');
        Sanctum::actingAs($assigned);
        $this->getJson("/api/staff/restaurants/a/orders/{$id}")->assertOk()->assertJsonPath('delivery_address.address_line', 'Avenue privée 42');
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'delivering', 'expected_version' => 2])->assertStatus(409);
        foreach ([['accepted', 2], ['preparing', 3], ['ready', 4], ['delivering', 5]] as [$status, $version]) {
            $this->patchJson("/api/staff/orders/{$id}/status", ['status' => $status, 'expected_version' => $version])->assertOk()->assertJsonPath('version', $version + 1);
        }
        Sanctum::actingAs($otherEmployee);
        $this->getJson("/api/staff/restaurants/a/orders/{$id}/tracking")->assertNotFound();
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'delivered', 'expected_version' => 6])->assertForbidden();
        Sanctum::actingAs($assigned);
        $this->postJson("/api/staff/orders/{$id}/delivery-position", ['latitude' => -4.325, 'longitude' => 15.31])->assertCreated()->assertJsonStructure(['recorded_at']);
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'delivered', 'expected_version' => 6, 'reason' => 'Remis au client'])->assertOk()->assertJsonPath('version', 7);
        $this->assertDatabaseHas('order_events', ['order_id' => $id, 'to_status' => 'delivered', 'order_version' => 7, 'reason' => 'Remis au client']);
        $event = \App\Models\OrderEvent::where('order_id', $id)->where('to_status', 'delivered')->firstOrFail();
        $this->assertSame($assigned->id, $event->actor_id);
        $this->assertNotNull($event->created_at);
        $this->getJson("/api/staff/restaurants/a/orders/{$id}")->assertOk()
            ->assertJsonPath('delivery_address', null)->assertDontSee('Avenue privée 42');
        $this->postJson("/api/staff/orders/{$id}/delivery-position", ['latitude' => -4.325, 'longitude' => 15.31])->assertStatus(409);
        Sanctum::actingAs($manager);
        $this->getJson("/api/staff/restaurants/a/orders/{$id}")->assertOk()
            ->assertJsonPath('delivery_address.address_line', 'Avenue privée 42');
        Sanctum::actingAs($student);
        $this->getJson("/api/me/orders/{$id}/tracking")->assertOk()->assertJsonPath('position.latitude', -4.325);
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);
        $this->getJson('/api/staff/restaurants/a/orders')->assertForbidden();
        $this->getJson('/api/platform/insights')->assertOk()->assertDontSee('Avenue privée 42');
    }

    public function test_dine_in_table_capacity_overlap_and_release_on_cancellation(): void
    {
        $restaurant = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $dish = $restaurant->contents()->create(['kind' => 'dish', 'title' => 'Plat', 'price_cdf' => 1000, 'is_published' => true]);
        $requested = Carbon::now('Africa/Kinshasa')->addDay()->setTime(12, 0);
        $slot = $restaurant->serviceSlots()->create(['service' => 'dine_in', 'weekday' => $requested->dayOfWeek, 'starts_at' => '11:00', 'ends_at' => '15:00']);
        Sanctum::actingAs($this->actor($restaurant, 'admin'));
        $table = $this->postJson('/api/staff/restaurants/a/tables', ['code' => 'T-1', 'capacity' => 2])->assertCreated()->json('id');
        $secondTable = $this->postJson('/api/staff/restaurants/a/tables', ['code' => 'T-2', 'capacity' => 2])->assertCreated()->json('id');
        $this->patchJson("/api/staff/restaurants/a/tables/{$table}", ['capacity' => 3, 'expected_version' => 0])->assertUnprocessable();
        $this->patchJson("/api/staff/restaurants/a/tables/{$table}", ['capacity' => 2, 'expected_version' => 1])->assertOk()->assertJsonPath('version', 2);
        $student1 = $this->student(); $student2 = $this->student();
        $body = ['service' => 'dine_in', 'requested_at' => $requested->toIso8601String(), 'service_slot_id' => $slot->id,
            'dining_table_id' => $table, 'party_size' => 2, 'items' => [['content_id' => $dish->id, 'quantity' => 1]]];
        Sanctum::actingAs($student1);
        $this->postJson('/api/restaurants/a/quotes', [...$body, 'party_size' => 3])->assertUnprocessable();
        $id = $this->withHeader('Idempotency-Key', 'table-order-001')->postJson('/api/restaurants/a/orders', $body)->assertCreated()->json('id');
        Sanctum::actingAs($student2);
        $this->postJson('/api/restaurants/a/quotes', $body)->assertUnprocessable();
        Sanctum::actingAs($this->actor($restaurant, 'manager'));
        $this->putJson("/api/staff/orders/{$id}/table-assignment", ['dining_table_id' => $secondTable, 'expected_version' => 1])->assertOk()->assertJsonPath('version', 2)->assertJsonPath('table.code', 'T-2');
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'cancelled', 'expected_version' => 2])->assertStatus(422);
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'cancelled', 'reason' => 'Table fermée', 'expected_version' => 2])->assertOk();
        $this->assertDatabaseHas('table_reservations', ['order_id' => $id, 'status' => 'released']);
        Sanctum::actingAs($student2);
        $this->withHeader('Idempotency-Key', 'table-order-002')->postJson('/api/restaurants/a/orders', $body)->assertCreated();
    }
}
