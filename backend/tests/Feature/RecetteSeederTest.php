<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use Database\Seeders\RecetteSeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PlatformRecetteSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecetteSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seed_is_idempotent_and_clear_is_reversible_without_touching_other_restaurants(): void
    {
        Restaurant::create(['id' => 'real', 'name' => 'Restaurant réel', 'is_demo' => false]);
        $this->seed(RecetteSeeder::class);
        $this->seed(RecetteSeeder::class);
        $this->assertDatabaseCount('restaurants', 3);
        $this->assertDatabaseCount('service_slots', 14);
        $this->getJson('/api/restaurants')->assertOk()->assertJsonFragment(['id' => 'recette-khalifa']);
        $this->artisan('mmm:recette:clear')->assertExitCode(0);
        $this->assertDatabaseCount('restaurants', 1);
        $this->assertDatabaseHas('restaurants', ['id' => 'real']);
        $this->assertDatabaseCount('service_slots', 0);
        $this->artisan('mmm:recette:clear')->assertExitCode(0);
    }

    public function test_clear_refuses_business_data_and_rolls_back_both_restaurants(): void
    {
        $this->seed(RecetteSeeder::class);
        $student = \App\Models\User::create(['name' => 'Recette', 'email' => 'recette@example.test', 'password' => 'LongPassword!123']);
        $student->studentProfile()->create([]);
        \App\Models\Order::create(['id' => 'RECETTE-ORDER', 'restaurant_id' => 'recette-sleepy',
            'user_id' => $student->id, 'customer_name' => 'Recette', 'service' => 'pickup',
            'status' => 'received', 'amount_cdf' => 4200]);
        $this->artisan('mmm:recette:clear')->assertExitCode(1);
        $this->assertDatabaseHas('restaurants', ['id' => 'recette-khalifa']);
        $this->assertDatabaseHas('restaurants', ['id' => 'recette-sleepy']);
    }

    public function test_platform_aggregate_recipe_can_be_removed_without_deleting_real_orders(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(PlatformRecetteSeeder::class);
        \App\Models\Order::create(['id' => 'REAL-ORDER', 'restaurant_id' => 'khalifa-food',
            'customer_name' => 'Client réel', 'service' => 'pickup', 'status' => 'accepted', 'amount_cdf' => 5000]);
        $this->assertDatabaseHas('orders', ['id' => 'DEMO-PLATFORM-KHALIFA-FOOD-0']);
        $this->artisan('mmm:recette:clear-platform')->assertExitCode(0);
        $this->assertDatabaseHas('orders', ['id' => 'REAL-ORDER']);
        $this->assertDatabaseMissing('orders', ['id' => 'DEMO-PLATFORM-KHALIFA-FOOD-0']);
        $this->assertDatabaseMissing('complaints', ['id' => 'DEMO-ESC-KHALIFA-FOOD']);
        $this->assertDatabaseCount('referrals', 0);
    }

    public function test_recipe_seeders_and_cleanup_are_disabled_in_production(): void
    {
        $this->app['env'] = 'production';
        $this->artisan('mmm:recette:clear')->assertExitCode(1);
        $this->artisan('mmm:recette:clear-platform')->assertExitCode(1);
        try {
            $this->app->make(RecetteSeeder::class)->run();
            $this->fail('RecetteSeeder aurait dû être refusé.');
        } catch (\RuntimeException $exception) {
            $this->assertStringContainsString('local et testing', $exception->getMessage());
        }
        $this->assertDatabaseCount('restaurants', 0);
    }
}
