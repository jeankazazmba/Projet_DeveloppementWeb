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
        $user = User::create(['name' => 'Gérant A', 'email' => 'a@example.test', 'password' => 'secret']);
        $user->restaurants()->attach($a->id, ['role' => 'manager']);
        $secret = $b->contents()->create(['kind' => 'dish', 'title' => 'Secret', 'is_published' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/staff/restaurants/b/content')->assertNotFound();
        $this->postJson('/api/staff/restaurants/b/content', ['kind' => 'dish', 'title' => 'Intrus'])->assertNotFound();
        $this->patchJson("/api/staff/restaurants/a/content/{$secret->id}", ['title' => 'Intrus'])->assertNotFound();
        $this->deleteJson("/api/staff/restaurants/a/content/{$secret->id}")->assertNotFound();
        $this->postJson('/api/staff/restaurants/a/content', ['kind' => 'dish', 'title' => 'Autorisé', 'restaurant_id' => 'b'])->assertCreated()->assertJsonFragment(['restaurant_id' => 'a']);
    }

    public function test_employee_has_read_access_without_write_access(): void
    {
        $restaurant = Restaurant::create(['id' => 'a', 'name' => 'A']);
        $user = User::create(['name' => 'Employé', 'email' => 'employee@example.test', 'password' => 'secret']);
        $user->restaurants()->attach($restaurant->id, ['role' => 'employee']);
        Sanctum::actingAs($user);

        $this->getJson('/api/staff/restaurants/a/content')->assertOk();
        $this->postJson('/api/staff/restaurants/a/content', ['kind' => 'dish', 'title' => 'Refusé'])->assertForbidden();
    }
}
