<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MenuPublicationTest extends TestCase
{
    use RefreshDatabase;

    private function actor(Restaurant $restaurant, string $role): User
    {
        $user = User::create(['name' => $role, 'email' => uniqid($role).'@example.test', 'password' => 'LongPassword!123']);
        $user->restaurants()->attach($restaurant->id, ['role' => $role]);
        return $user;
    }

    public function test_public_catalog_filters_drafts_expired_future_stock_and_restaurants(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $a->contents()->create(['kind' => 'dish', 'title' => 'Visible', 'price_cdf' => 1000, 'is_published' => true, 'stock_quantity' => 2]);
        $a->contents()->create(['kind' => 'dish', 'title' => 'Rupture', 'price_cdf' => 1000, 'is_published' => true, 'stock_quantity' => 0]);
        $a->contents()->create(['kind' => 'event', 'title' => 'Futur', 'is_published' => true, 'published_from' => now()->addDay()]);
        $a->contents()->create(['kind' => 'game', 'title' => 'Expiré', 'is_published' => true, 'published_until' => now()->subMinute()]);
        $a->contents()->create(['kind' => 'promotion', 'title' => 'Brouillon', 'is_published' => false]);
        $b->contents()->create(['kind' => 'promotion', 'title' => 'Autre restaurant', 'is_published' => true]);
        $this->getJson('/api/restaurants/a/content')->assertOk()->assertJsonCount(1)->assertJsonFragment(['title' => 'Visible']);
        $this->getJson('/api/restaurants/a/menu')->assertOk()->assertJsonCount(1, 'dishes')->assertJsonPath('currency', 'CDF');
        $this->getJson('/api/restaurants/b/content')->assertOk()->assertJsonCount(1)->assertJsonFragment(['title' => 'Autre restaurant']);
    }

    public function test_only_local_admin_edits_menu_and_employee_only_service_flags(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $admin = $this->actor($a, 'admin');
        $manager = $this->actor($a, 'manager');
        $employee = $this->actor($a, 'employee');
        $platform = User::create(['name' => 'Platform', 'email' => 'platform@example.test', 'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        Sanctum::actingAs($admin);
        $category = $this->postJson('/api/staff/restaurants/a/categories', ['name' => 'Plats', 'sort_order' => 1])->assertCreated()->json('id');
        $this->postJson('/api/staff/restaurants/a/content', ['kind' => 'dish', 'title' => 'Sans prix'])->assertUnprocessable();
        $dish = $this->postJson('/api/staff/restaurants/a/content', ['kind' => 'dish', 'title' => 'Poulet', 'price_cdf' => 2500, 'category_id' => $category, 'stock_quantity' => 3, 'is_published' => true])->assertCreated()->json('id');
        $this->postJson('/api/staff/restaurants/b/content', ['kind' => 'dish', 'title' => 'Intrus', 'price_cdf' => 1])->assertNotFound();
        $option = $this->postJson("/api/staff/restaurants/a/content/{$dish}/options", ['kind' => 'supplement', 'name' => 'Sauce', 'price_delta_cdf' => 500])->assertCreated()->json('id');
        $allergen = $this->postJson('/api/staff/restaurants/a/allergens', ['name' => 'Arachides'])->assertCreated()->json('id');
        $this->putJson("/api/staff/restaurants/a/content/{$dish}/allergens", ['allergen_ids' => [$allergen], 'expected_version' => 1])->assertOk()->assertJsonPath('version', 2);
        $this->patchJson("/api/staff/restaurants/a/content/{$dish}", ['price_cdf' => 2600, 'expected_version' => 1])->assertStatus(409);
        $this->patchJson("/api/staff/restaurants/a/content/{$dish}", ['price_cdf' => 2600, 'expected_version' => 2])->assertOk()->assertJsonPath('version', 3);
        $this->patchJson("/api/staff/restaurants/a/content/{$dish}/options/{$option}", ['price_delta_cdf' => 600, 'expected_version' => 1])->assertOk()->assertJsonPath('version', 2);
        $this->getJson('/api/restaurants/a/menu')->assertOk()->assertJsonPath('dishes.0.options.0.price_delta_cdf', 600)->assertJsonPath('dishes.0.allergens.0.name', 'Arachides');
        Sanctum::actingAs($manager);
        $this->postJson('/api/staff/restaurants/a/categories', ['name' => 'Non'])->assertForbidden();
        $this->patchJson("/api/staff/restaurants/a/content/{$dish}", ['price_cdf' => 1])->assertForbidden();
        $this->patchJson("/api/staff/restaurants/a/content/{$dish}/service", ['is_available' => false])->assertForbidden();
        Sanctum::actingAs($employee);
        $this->postJson("/api/staff/restaurants/a/content/{$dish}/options", ['kind' => 'supplement', 'name' => 'Non', 'price_delta_cdf' => 1])->assertForbidden();
        $this->patchJson("/api/staff/restaurants/a/content/{$dish}/service", ['is_available' => false, 'price_cdf' => 1, 'expected_version' => 3])->assertOk()->assertJsonPath('is_available', false);
        $this->assertDatabaseHas('restaurant_contents', ['id' => $dish, 'price_cdf' => 2600, 'stock_quantity' => 3]);
        $this->getJson('/api/restaurants/a/menu')->assertOk()->assertJsonCount(0, 'dishes');
        Sanctum::actingAs($platform);
        $this->getJson('/api/staff/restaurants/a/categories')->assertForbidden();
    }

    public function test_promotions_events_and_games_have_tenant_publication_windows(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        Sanctum::actingAs($this->actor($a, 'admin'));
        foreach (['promotion', 'event', 'game'] as $kind) {
            $this->postJson('/api/staff/restaurants/a/content', [
                'kind' => $kind, 'title' => $kind, 'is_published' => true,
                'published_from' => now()->subHour()->toIso8601String(),
                'published_until' => now()->addHour()->toIso8601String(),
            ])->assertCreated();
        }
        $this->postJson('/api/staff/restaurants/a/content', [
            'kind' => 'event', 'title' => 'Date invalide',
            'published_from' => now()->addHour()->toIso8601String(),
            'published_until' => now()->toIso8601String(),
        ])->assertUnprocessable();
        $this->getJson('/api/restaurants/a/content')->assertOk()->assertJsonCount(3);
        $this->getJson('/api/restaurants/a/content?kind=game')->assertOk()->assertJsonCount(1)->assertJsonFragment(['title' => 'game']);
        $this->getJson('/api/restaurants/b/content')->assertOk()->assertJsonCount(0);
        $this->postJson('/api/staff/restaurants/b/content', ['kind' => 'promotion', 'title' => 'Intrus'])->assertNotFound();
    }
}
