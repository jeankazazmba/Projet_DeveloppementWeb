<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LoyaltyGamesTest extends TestCase
{
    use RefreshDatabase;

    private function student(string $name): User
    {
        $user = User::create(['name' => $name, 'email' => strtolower($name).'@example.test', 'password' => 'LongPassword!123']);
        $user->studentProfile()->create([]);
        return $user;
    }

    private function readyOrder(Restaurant $restaurant, User $student, string $id): Order
    {
        return Order::create(['id' => $id, 'restaurant_id' => $restaurant->id, 'user_id' => $student->id,
            'customer_name' => $student->name, 'service' => 'pickup', 'status' => 'ready', 'amount_cdf' => 1000]);
    }

    public function test_validated_rule_atomic_awards_referrals_and_private_balances(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@example.test', 'password' => 'LongPassword!123']);
        $admin->restaurants()->attach('a', ['role' => 'admin']);
        $manager = User::create(['name' => 'Manager', 'email' => 'manager@example.test', 'password' => 'LongPassword!123']);
        $manager->restaurants()->attach('a', ['role' => 'manager']);
        Sanctum::actingAs($admin);
        $rule = $this->postJson('/api/staff/restaurants/a/loyalty-rules', ['points_per_order' => 10, 'referral_points' => 5])->assertCreated()->json('id');
        $this->postJson("/api/staff/restaurants/a/loyalty-rules/{$rule}/activate", ['expected_version' => 1])->assertStatus(409);
        Sanctum::actingAs($manager);
        $this->postJson("/api/staff/restaurants/a/loyalty-rules/{$rule}/validate", ['expected_version' => 1, 'validation_note' => 'Règle acceptée'])->assertForbidden();
        Sanctum::actingAs($admin);
        $this->postJson("/api/staff/restaurants/a/loyalty-rules/{$rule}/validate", ['expected_version' => 1, 'validation_note' => 'Règle validée pour ce restaurant'])->assertOk();
        $this->postJson("/api/staff/restaurants/a/loyalty-rules/{$rule}/activate", ['expected_version' => 2])->assertOk();
        $referrer = $this->student('Parrain'); $referee = $this->student('Filleul');
        Sanctum::actingAs($referrer);
        $code = $this->postJson('/api/restaurants/a/referral-code')->assertOk()->json('code');
        Sanctum::actingAs($referee);
        $this->postJson('/api/restaurants/a/referrals', ['code' => $code])->assertCreated();
        $this->postJson('/api/restaurants/a/referrals', ['code' => $code])->assertStatus(409);
        $this->readyOrder($a, $referee, 'O-1');
        Sanctum::actingAs($admin);
        $this->patchJson('/api/staff/orders/O-1/status', ['status' => 'served', 'expected_version' => 1])->assertOk();
        $this->patchJson('/api/staff/orders/O-1/status', ['status' => 'served', 'expected_version' => 2])->assertStatus(409);
        $this->assertDatabaseCount('loyalty_movements', 2);
        $this->assertDatabaseHas('loyalty_movements', ['user_id' => $referee->id, 'points' => 10, 'event_key' => 'order:O-1:earned']);
        $this->assertDatabaseHas('loyalty_movements', ['user_id' => $referrer->id, 'points' => 5]);
        Sanctum::actingAs($referee);
        $this->getJson('/api/me/loyalty')->assertOk()->assertJsonPath('balances.a', 10)->assertDontSee('Parrain');
        $this->getJson('/api/me/referrals')->assertOk()->assertJsonCount(0, 'referrals');
        Sanctum::actingAs($referrer);
        $this->getJson('/api/me/loyalty')->assertOk()->assertJsonPath('balances.a', 5);
        $this->getJson('/api/me/referrals')->assertOk()->assertJsonPath('referrals.0.status', 'rewarded')->assertJsonMissingPath('referrals.0.referee_id');
        $this->getJson('/api/restaurants/b/leaderboard?period=day')->assertOk()->assertJsonCount(0, 'top');
    }

    public function test_leaderboard_top_ten_and_game_participation_are_scoped(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $game = $a->contents()->create(['kind' => 'game', 'title' => 'Quiz', 'is_published' => true]);
        for ($i = 1; $i <= 11; $i++) {
            $student = $this->student('Client'.$i);
            $order = $this->readyOrder($a, $student, 'O-'.$i);
            $order->update(['status' => 'served']);
            $order->events()->create(['actor_id' => null, 'from_status' => 'ready', 'to_status' => 'served', 'action' => 'status_changed', 'order_version' => 2, 'created_at' => now()]);
        }
        $this->getJson('/api/restaurants/a/leaderboard?period=day')->assertOk()->assertJsonCount(10, 'top')
            ->assertJsonPath('top.0.eligible_orders', 1)->assertJsonMissingPath('top.0.user_id')->assertDontSee('Client1@example.test');
        $this->getJson('/api/restaurants/a/leaderboard?period=year')->assertUnprocessable();
        Sanctum::actingAs(User::where('email', 'client1@example.test')->firstOrFail());
        $this->postJson("/api/restaurants/a/games/{$game->id}/participations")->assertCreated();
        $this->postJson("/api/restaurants/a/games/{$game->id}/participations")->assertStatus(409);
        $this->postJson("/api/restaurants/b/games/{$game->id}/participations")->assertNotFound();
        $this->getJson('/api/me/game-participations')->assertOk()->assertJsonCount(1);
    }
}
