<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlatformSeparationTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_role_alone_cannot_open_private_restaurant_catalog(): void
    {
        $restaurant = Restaurant::create(['id' => 'khalifa', 'name' => 'Khalifa', 'status' => 'active', 'is_public' => true]);
        $restaurant->contents()->create(['kind' => 'dish', 'title' => 'Recette interne', 'is_published' => false]);
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'password123456', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);

        $this->getJson('/api/staff/restaurants')->assertOk()->assertJsonCount(0);
        $this->getJson('/api/staff/restaurants/khalifa/content')->assertNotFound();
        $this->postJson('/api/staff/restaurants/khalifa/content', ['kind' => 'dish', 'title' => 'Intrus'])->assertNotFound();

        $platform->restaurants()->attach($restaurant->id, ['role' => 'admin']);
        $this->getJson('/api/staff/restaurants/khalifa/content')->assertOk()->assertJsonFragment(['title' => 'Recette interne']);
    }

    public function test_platform_insights_return_aggregates_without_order_or_complaint_details(): void
    {
        $restaurant = Restaurant::create(['id' => 'khalifa', 'name' => 'Khalifa', 'status' => 'active', 'is_public' => true]);
        $restaurant->contents()->create(['kind' => 'dish', 'title' => 'Brouillon interne', 'is_published' => false]);
        $restaurant->contents()->create(['kind' => 'promotion', 'title' => 'Offre publique', 'is_published' => true]);
        DB::table('orders')->insert(['id' => 'CMD-1', 'restaurant_id' => 'khalifa', 'customer_name' => 'Client confidentiel', 'service' => 'delivery', 'status' => 'paid', 'amount_cdf' => 6000, 'created_at' => now(), 'updated_at' => now()]);
        DB::table('complaints')->insert(['id' => 'ESC-1', 'restaurant_id' => 'khalifa', 'student_name' => 'Étudiant confidentiel', 'reason' => 'Motif confidentiel', 'status' => 'open', 'escalated' => true, 'created_at' => now(), 'updated_at' => now()]);
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'password123456', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);

        $this->getJson('/api/platform/insights')->assertOk()
            ->assertJsonPath('summary.orders', 1)
            ->assertJsonPath('summary.published_contents', 1)
            ->assertJsonPath('complaints.0.id', 'ESC-1')
            ->assertJsonMissingPath('orders')
            ->assertJsonMissingPath('contents')
            ->assertJsonMissingPath('loyalty')
            ->assertJsonMissingPath('referrals')
            ->assertDontSee('Client confidentiel')
            ->assertDontSee('Étudiant confidentiel')
            ->assertDontSee('Motif confidentiel')
            ->assertDontSee('Brouillon interne');
    }

    public function test_platform_account_management_excludes_employee_accounts(): void
    {
        $restaurant = Restaurant::create(['id' => 'khalifa', 'name' => 'Khalifa']);
        $employee = User::create(['name' => 'Employé interne', 'email' => 'employee@example.test', 'password' => 'password123456']);
        $employee->restaurants()->attach($restaurant->id, ['role' => 'employee']);
        $admin = User::create(['name' => 'Admin restaurant', 'email' => 'admin@example.test', 'password' => 'password123456']);
        $admin->restaurants()->attach($restaurant->id, ['role' => 'admin']);
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'password123456', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);

        $this->getJson('/api/platform/users')->assertOk()
            ->assertJsonFragment(['email' => 'admin@example.test'])
            ->assertJsonMissing(['email' => 'employee@example.test']);
        $this->postJson('/api/platform/users', ['name' => 'Nouvel employé', 'email' => 'new@example.test', 'password' => 'password123456', 'restaurant_id' => 'khalifa', 'role' => 'employee'])->assertUnprocessable();
        $this->putJson("/api/platform/restaurants/khalifa/members/{$employee->id}", ['role' => 'admin'])->assertNotFound();
    }

    public function test_platform_audit_excludes_content_actions_and_private_change_payloads(): void
    {
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'password123456', 'is_platform_admin' => true]);
        DB::table('platform_audit_logs')->insert([
            ['actor_id' => $platform->id, 'action' => 'assignment.saved', 'target_type' => 'user', 'target_id' => '12', 'changes' => json_encode(['private' => 'Donnée interne']), 'created_at' => now(), 'updated_at' => now()],
            ['actor_id' => $platform->id, 'action' => 'content.updated', 'target_type' => 'content', 'target_id' => '7', 'changes' => json_encode(['title' => 'Brouillon confidentiel']), 'created_at' => now(), 'updated_at' => now()],
        ]);
        Sanctum::actingAs($platform);

        $this->getJson('/api/platform/audit')->assertOk()->assertJsonCount(1)
            ->assertJsonPath('0.action', 'assignment.saved')
            ->assertJsonMissingPath('0.changes')
            ->assertDontSee('Donnée interne')
            ->assertDontSee('Brouillon confidentiel');
    }
}
