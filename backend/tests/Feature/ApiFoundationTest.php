<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_private_api_returns_standard_unauthenticated_error(): void
    {
        $this->getJson('/api/platform/restaurants')->assertUnauthorized()
            ->assertJsonPath('error.code', 'unauthenticated')
            ->assertJsonStructure(['message', 'error' => ['code', 'message']]);
    }

    public function test_suspended_platform_admin_is_refused(): void
    {
        $user = User::create(['name' => 'Suspendu', 'email' => 'suspended@example.test', 'password' => 'password123456', 'is_platform_admin' => true, 'is_active' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/platform/restaurants')->assertForbidden()->assertJsonPath('error.code', 'forbidden');
    }

    public function test_stale_restaurant_update_returns_a_conflict(): void
    {
        $restaurant = Restaurant::create(['id' => 'a', 'name' => 'A']);
        $user = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'password123456', 'is_platform_admin' => true]);
        Sanctum::actingAs($user);

        $this->patchJson('/api/platform/restaurants/a', ['name' => 'A modifié', 'expected_version' => 99])
            ->assertConflict()->assertJsonPath('error.code', 'conflict');
        $this->assertDatabaseHas('restaurants', ['id' => 'a', 'name' => 'A', 'version' => 1]);
    }

    public function test_public_and_platform_lists_support_opt_in_pagination_and_safe_filters(): void
    {
        Restaurant::create(['id' => 'khalifa', 'name' => 'Khalifa_food', 'status' => 'active', 'is_public' => true]);
        Restaurant::create(['id' => 'sleepy', 'name' => 'sleepy hollow', 'status' => 'draft']);
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'password123456', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);

        $this->getJson('/api/restaurants?paginate=1&per_page=1&q=Khalifa')->assertOk()
            ->assertJsonPath('data.0.id', 'khalifa')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/platform/restaurants?paginate=1&per_page=1&status=draft')->assertOk()
            ->assertJsonPath('data.0.id', 'sleepy')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/platform/restaurants?per_page=101')->assertUnprocessable()->assertJsonPath('error.code', 'validation_failed');
    }
}
