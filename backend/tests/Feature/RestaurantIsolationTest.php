<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RestaurantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_hides_private_restaurants_and_drafts(): void
    {
        $public = Restaurant::create(['id' => 'a', 'name' => 'A', 'is_public' => true, 'status' => 'active']);
        $private = Restaurant::create(['id' => 'b', 'name' => 'B', 'is_public' => false, 'status' => 'draft']);
        $public->contents()->create(['kind' => 'dish', 'title' => 'Visible', 'is_published' => true]);
        $public->contents()->create(['kind' => 'dish', 'title' => 'Brouillon', 'is_published' => false]);
        $private->contents()->create(['kind' => 'dish', 'title' => 'Secret', 'is_published' => true]);

        $this->getJson('/api/restaurants')->assertOk()->assertJsonCount(1)->assertJsonFragment(['id' => 'a'])->assertJsonMissing(['id' => 'b']);
        $this->getJson('/api/restaurants/a/content')->assertOk()->assertJsonCount(1)->assertJsonFragment(['title' => 'Visible'])->assertJsonMissing(['title' => 'Brouillon']);
        $this->getJson('/api/restaurants/b/content')->assertNotFound();
    }

    public function test_staff_cannot_read_or_write_another_restaurants_content(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'is_public' => true]);
        $user = User::create(['name' => 'Admin A', 'email' => 'a@example.test', 'password' => 'secret']);
        $user->restaurants()->attach($a->id, ['role' => 'admin']);
        $secret = $b->contents()->create(['kind' => 'dish', 'title' => 'Secret', 'is_published' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/staff/restaurants/b/content')->assertNotFound();
        $this->postJson('/api/staff/restaurants/b/content', ['kind' => 'dish', 'title' => 'Intrus'])->assertNotFound();
        $this->patchJson("/api/staff/restaurants/a/content/{$secret->id}", ['title' => 'Intrus'])->assertNotFound();
        $this->deleteJson("/api/staff/restaurants/a/content/{$secret->id}")->assertNotFound();
        $this->postJson('/api/staff/restaurants/a/content', ['kind' => 'dish', 'title' => 'Autorisé', 'restaurant_id' => 'b'])->assertCreated()->assertJsonFragment(['restaurant_id' => 'a']);
    }

    public function test_manager_sees_only_published_dishes_and_cannot_edit_catalog_or_service(): void
    {
        $restaurant = Restaurant::create(['id' => 'a', 'name' => 'A']);
        $dish = $restaurant->contents()->create(['kind' => 'dish', 'title' => 'Plat public', 'price_cdf' => 3000, 'is_published' => true]);
        $restaurant->contents()->create(['kind' => 'promotion', 'title' => 'Brouillon interne', 'is_published' => false]);
        $user = User::create(['name' => 'Gérant', 'email' => 'manager@example.test', 'password' => 'secret']);
        $user->restaurants()->attach($restaurant->id, ['role' => 'manager']);
        Sanctum::actingAs($user);

        $this->getJson('/api/staff/restaurants/a/content')->assertOk()->assertJsonCount(1)->assertJsonMissingPath('0.details')->assertDontSee('Brouillon interne');
        $this->postJson('/api/staff/restaurants/a/content', ['kind' => 'dish', 'title' => 'Refusé'])->assertForbidden();
        $this->patchJson("/api/staff/restaurants/a/content/{$dish->id}", ['title' => 'Refusé'])->assertForbidden();
        $this->patchJson("/api/staff/restaurants/a/content/{$dish->id}/service", ['is_available' => false])->assertForbidden();
    }

    public function test_employee_can_change_only_published_dish_service_flags(): void
    {
        $restaurant = Restaurant::create(['id' => 'a', 'name' => 'A']);
        $dish = $restaurant->contents()->create(['kind' => 'dish', 'title' => 'Plat public', 'price_cdf' => 3000, 'is_published' => true]);
        $other = $restaurant->contents()->create(['kind' => 'dish', 'title' => 'Autre plat', 'price_cdf' => 2000, 'is_published' => true, 'is_featured' => true]);
        $draft = $restaurant->contents()->create(['kind' => 'dish', 'title' => 'Recette secrète', 'is_published' => false]);
        $user = User::create(['name' => 'Employé', 'email' => 'employee@example.test', 'password' => 'secret']);
        $user->restaurants()->attach($restaurant->id, ['role' => 'employee']);
        Sanctum::actingAs($user);

        $this->getJson('/api/staff/restaurants/a/content')->assertOk()->assertJsonCount(2)->assertJsonMissingPath('0.details')->assertDontSee('Recette secrète');
        $this->patchJson("/api/staff/restaurants/a/content/{$dish->id}/service", ['is_featured' => true])->assertOk()->assertJsonPath('is_featured', true);
        $this->assertDatabaseHas('restaurant_contents', ['id' => $other->id, 'is_featured' => false]);
        $this->patchJson("/api/staff/restaurants/a/content/{$dish->id}/service", ['is_available' => false, 'price_cdf' => 1])->assertOk()->assertJsonPath('is_available', false);
        $this->assertDatabaseHas('restaurant_contents', ['id' => $dish->id, 'price_cdf' => 3000, 'is_available' => false]);
        $this->patchJson("/api/staff/restaurants/a/content/{$draft->id}/service", ['is_available' => false])->assertNotFound();
        $this->patchJson("/api/staff/restaurants/a/content/{$dish->id}", ['price_cdf' => 1])->assertForbidden();
    }
}
