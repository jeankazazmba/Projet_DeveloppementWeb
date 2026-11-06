<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecetteIsolationMatrixTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_routes_are_scoped_across_the_business_domains(): void
    {
        $a = Restaurant::create(['id' => 'tenant-a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'tenant-b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $a->contents()->create(['kind' => 'dish', 'title' => 'Secret A', 'price_cdf' => 1500, 'is_published' => true]);
        $b->contents()->create(['kind' => 'dish', 'title' => 'Secret B', 'price_cdf' => 2000, 'is_published' => true]);
        $admin = User::create(['name' => 'Admin A', 'email' => 'admin-a@matrix.test', 'password' => 'LongPassword!123']);
        $admin->restaurants()->attach($a->id, ['role' => 'admin']);
        $student = User::create(['name' => 'Étudiant A', 'email' => 'student@matrix.test', 'password' => 'LongPassword!123']);
        $student->studentProfile()->create([]);
        Order::create(['id' => 'MATRIX-ORDER-A', 'restaurant_id' => $a->id, 'user_id' => $student->id,
            'customer_name' => 'Étudiant A', 'service' => 'pickup', 'status' => 'accepted', 'amount_cdf' => 1500]);
        \Illuminate\Support\Facades\DB::table('complaints')->insert(['id' => 'MATRIX-COMPLAINT-A', 'restaurant_id' => $a->id,
            'user_id' => $student->id, 'student_name' => 'Étudiant A', 'reason' => 'Motif privé A',
            'status' => 'ouverte', 'created_at' => now(), 'updated_at' => now()]);

        Sanctum::actingAs($admin);
        foreach (['content', 'orders', 'complaints', 'tables', 'delivery-zones', 'categories', 'allergens',
            'service-slots', 'members', 'statistics'] as $path) {
            $this->getJson("/api/staff/restaurants/tenant-a/{$path}")->assertOk();
            $this->getJson("/api/staff/restaurants/tenant-b/{$path}")->assertNotFound();
        }
        $this->getJson('/api/staff/restaurants/tenant-a/orders/MATRIX-ORDER-A')->assertOk();
        $this->getJson('/api/staff/restaurants/tenant-b/orders/MATRIX-ORDER-A')->assertNotFound();
        $this->getJson('/api/staff/restaurants/tenant-b/complaints/MATRIX-COMPLAINT-A')->assertNotFound();
        $this->patchJson('/api/staff/orders/MATRIX-ORDER-A/status', ['status' => 'preparing', 'expected_version' => 1])->assertOk();

        $admin->restaurants()->updateExistingPivot($a->id, ['is_active' => false]);
        $this->getJson('/api/staff/restaurants/tenant-a/orders')->assertNotFound();
        $this->getJson('/api/staff/restaurants/tenant-a/statistics')->assertNotFound();

        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@matrix.test',
            'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);
        $this->getJson('/api/staff/restaurants/tenant-a/orders')->assertForbidden();
        $this->getJson('/api/staff/restaurants/tenant-a/complaints')->assertForbidden();
        $this->getJson('/api/platform/insights')->assertOk()->assertDontSee('Étudiant A')->assertDontSee('Motif privé A');
    }

    public function test_payment_intents_are_private_to_the_student_even_across_restaurants(): void
    {
        $a = Restaurant::create(['id' => 'tenant-a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'tenant-b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $first = User::create(['name' => 'A', 'email' => 'one@matrix.test', 'password' => 'LongPassword!123']);
        $second = User::create(['name' => 'B', 'email' => 'two@matrix.test', 'password' => 'LongPassword!123']);
        $first->studentProfile()->create([]); $second->studentProfile()->create([]);
        Order::create(['id' => 'MATRIX-PAY-A', 'restaurant_id' => $a->id, 'user_id' => $first->id,
            'customer_name' => 'A', 'service' => 'pickup', 'status' => 'received', 'amount_cdf' => 1500]);
        Order::create(['id' => 'MATRIX-PAY-B', 'restaurant_id' => $b->id, 'user_id' => $second->id,
            'customer_name' => 'B', 'service' => 'pickup', 'status' => 'received', 'amount_cdf' => 2000]);
        Sanctum::actingAs($first);
        $this->getJson('/api/me/orders/MATRIX-PAY-B')->assertNotFound();
        $this->postJson('/api/me/orders/MATRIX-PAY-B/payment-intents', ['method' => 'cash'])->assertNotFound();
        $this->withHeader('Idempotency-Key', 'matrix-payment-001')
            ->postJson('/api/me/orders/MATRIX-PAY-A/payment-intents', ['method' => 'cash'])
            ->assertCreated()->assertJsonPath('status', 'cash_due');
        $this->assertDatabaseCount('payment_intents', 1);
        Sanctum::actingAs($second);
        $this->getJson('/api/me/orders/MATRIX-PAY-A/payment-intents')->assertNotFound();
    }
}
