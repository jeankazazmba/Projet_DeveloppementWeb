<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CrossAppOrderFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_order_reaches_only_its_restaurant_and_completed_totals_update(): void
    {
        $a = Restaurant::create(['id' => 'flow-a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'flow-b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $dish = $a->contents()->create(['kind' => 'dish', 'title' => 'Plat A', 'price_cdf' => 2400, 'is_published' => true]);
        $requested = Carbon::now('Africa/Kinshasa')->addDay()->setTime(12, 0);
        $slot = $a->serviceSlots()->create(['service' => 'pickup', 'weekday' => $requested->dayOfWeek,
            'starts_at' => '11:00', 'ends_at' => '14:00']);
        $student = User::create(['name' => 'Client test', 'email' => 'flow-student@example.test', 'password' => 'LongPassword!123']);
        $student->studentProfile()->create([]);
        $employee = User::create(['name' => 'Équipier A', 'email' => 'flow-employee@example.test', 'password' => 'LongPassword!123']);
        $employee->restaurants()->attach($a->id, ['role' => 'employee']);
        $manager = User::create(['name' => 'Gérant A', 'email' => 'flow-manager@example.test', 'password' => 'LongPassword!123']);
        $manager->restaurants()->attach($a->id, ['role' => 'manager']);
        $foreign = User::create(['name' => 'Équipier B', 'email' => 'flow-foreign@example.test', 'password' => 'LongPassword!123']);
        $foreign->restaurants()->attach($b->id, ['role' => 'employee']);
        $platform = User::create(['name' => 'Plateforme', 'email' => 'flow-platform@example.test',
            'password' => 'LongPassword!123', 'is_platform_admin' => true]);

        Sanctum::actingAs($student);
        $body = ['service' => 'pickup', 'requested_at' => $requested->toIso8601String(),
            'service_slot_id' => $slot->id, 'items' => [['content_id' => $dish->id, 'quantity' => 1]]];
        $id = $this->withHeader('Idempotency-Key', 'cross-app-order-001')
            ->postJson('/api/restaurants/flow-a/orders', $body)->assertCreated()
            ->assertJsonPath('amount_cdf', 2400)->json('id');
        $this->getJson("/api/me/orders/{$id}")->assertOk()->assertJsonPath('status', 'received');

        Sanctum::actingAs($foreign);
        $this->getJson("/api/staff/restaurants/flow-b/orders/{$id}")->assertNotFound();
        $this->patchJson("/api/staff/orders/{$id}/status", ['status' => 'accepted', 'expected_version' => 1])->assertNotFound();
        Sanctum::actingAs($manager);
        $this->getJson('/api/staff/restaurants/flow-a/statistics')->assertOk()->assertJsonPath('orders.completed', 0);
        Sanctum::actingAs($employee);
        $this->getJson('/api/staff/restaurants/flow-a/orders')->assertOk()->assertJsonPath('data.0.id', $id);
        foreach ([['accepted', 1], ['preparing', 2], ['ready', 3], ['served', 4]] as [$status, $version]) {
            $this->patchJson("/api/staff/orders/{$id}/status", ['status' => $status, 'expected_version' => $version])
                ->assertOk()->assertJsonPath('version', $version + 1);
        }
        Sanctum::actingAs($manager);
        $this->getJson('/api/staff/restaurants/flow-a/statistics')->assertOk()
            ->assertJsonPath('orders.completed', 1)->assertJsonPath('orders.completed_volume_cdf', 2400);
        $this->getJson('/api/staff/restaurants/flow-b/statistics')->assertNotFound();
        Sanctum::actingAs($student);
        $this->getJson("/api/me/orders/{$id}")->assertOk()->assertJsonPath('status', 'served');
        Sanctum::actingAs($platform);
        $this->getJson('/api/platform/insights')->assertOk()
            ->assertJsonPath('summary.completed_orders', 1)->assertJsonPath('summary.completed_volume_cdf', 2400)
            ->assertDontSee('Client test')->assertDontSee($id);
        $this->getJson('/api/staff/restaurants/flow-a/orders')->assertForbidden();
    }
}
