<?php

namespace Tests\Feature;

use App\Jobs\BuildStatisticsExport;
use App\Jobs\PersistDomainNotification;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StatisticsNotificationsTest extends TestCase
{
    use RefreshDatabase;

    private function fixture(): array
    {
        $a = Restaurant::create(['id' => 'stats-a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'stats-b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $manager = User::create(['name' => 'Gérant', 'email' => 'manager-stats@example.test', 'password' => 'LongPassword!123']);
        $manager->restaurants()->attach($a->id, ['role' => 'manager']);
        $student = User::create(['name' => 'Nom secret', 'email' => 'student-stats@example.test', 'password' => 'LongPassword!123']);
        $student->studentProfile()->create([]);
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform-stats@example.test',
            'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        Order::create(['id' => 'STATS-1', 'restaurant_id' => $a->id, 'user_id' => $student->id,
            'customer_name' => 'Nom secret', 'service' => 'pickup', 'status' => 'accepted', 'amount_cdf' => 4000]);
        Order::create(['id' => 'STATS-2', 'restaurant_id' => $a->id, 'user_id' => $student->id,
            'customer_name' => 'Nom secret', 'service' => 'pickup', 'status' => 'received', 'amount_cdf' => 9000]);
        Order::create(['id' => 'STATS-3', 'restaurant_id' => $b->id, 'user_id' => $student->id,
            'customer_name' => 'Autre secret', 'service' => 'delivery', 'status' => 'delivered', 'amount_cdf' => 7000]);
        DB::table('loyalty_movements')->insert(['restaurant_id' => $a->id, 'user_id' => $student->id,
            'points' => 12, 'reason' => 'Détail secret', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('referrals')->insert(['restaurant_id' => $a->id, 'referrer_id' => $student->id,
            'status' => 'rewarded', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('complaints')->insert(['id' => 'REC-STATS', 'restaurant_id' => $a->id, 'user_id' => $student->id,
            'student_name' => 'Nom secret', 'reason' => 'Motif secret', 'status' => 'escaladee',
            'escalated' => true, 'created_at' => now(), 'updated_at' => now()]);
        return compact('a', 'b', 'manager', 'student', 'platform');
    }

    public function test_confirmed_statistics_and_platform_projection_are_separate(): void
    {
        $f = $this->fixture();
        $this->getJson('/api/staff/restaurants/stats-a/statistics')->assertUnauthorized();
        Sanctum::actingAs($f['manager']);
        $this->getJson('/api/staff/restaurants/stats-a/statistics')->assertOk()
            ->assertJsonPath('orders.confirmed', 1)->assertJsonPath('orders.volume_cdf', 4000)
            ->assertJsonPath('loyalty.points_issued', 12)->assertJsonPath('referrals.rewarded', 1)
            ->assertDontSee('Autre secret');
        $this->getJson('/api/staff/restaurants/stats-b/statistics')->assertNotFound();
        $this->getJson('/api/platform/insights')->assertForbidden();
        Sanctum::actingAs($f['platform']);
        $this->getJson('/api/staff/restaurants/stats-a/statistics')->assertForbidden();
        $this->getJson('/api/platform/insights')->assertOk()
            ->assertJsonPath('summary.orders', 2)->assertJsonPath('summary.order_volume_cdf', 11000)
            ->assertJsonPath('summary.points_issued', 12)
            ->assertDontSee('Nom secret')->assertDontSee('Motif secret')
            ->assertDontSee('Détail secret')->assertDontSee('STATS-1')
            ->assertDontSee('payment_intents')->assertJsonMissingPath('orders')
            ->assertJsonMissingPath('loyalty_movements');
    }

    public function test_persisted_notifications_polling_revoke_and_private_export(): void
    {
        Storage::fake('local');
        $f = $this->fixture();
        $studentNotice = new PersistDomainNotification($f['student']->id, $f['a']->id, 'student', 'order_status',
            'order:STATS-1:accepted', ['order_id' => 'STATS-1', 'status' => 'accepted']);
        $studentNotice->handle();
        $studentNotice->handle();
        (new PersistDomainNotification($f['manager']->id, $f['a']->id, 'staff', 'order_received',
            'order:STATS-1:received', ['order_id' => 'STATS-1']))->handle();
        (new PersistDomainNotification($f['platform']->id, $f['a']->id, 'platform', 'complaint_escalated',
            'complaint:REC-STATS:escaladee', ['complaint_id' => 'REC-STATS', 'restaurant_id' => $f['a']->id,
                'status' => 'escaladee', 'date' => now()->toIso8601String()]))->handle();
        $this->assertDatabaseCount('app_notifications', 3);
        Sanctum::actingAs($f['student']);
        $noticeId = $this->getJson('/api/me/notifications')->assertOk()->assertJsonPath('unread_count', 1)
            ->assertJsonPath('notifications.total', 1)->assertDontSee('REC-STATS')->json('notifications.data.0.id');
        $this->patchJson("/api/me/notifications/{$noticeId}/read")->assertOk();
        $this->getJson('/api/me/notifications?unread=1')->assertOk()->assertJsonPath('unread_count', 0);
        Sanctum::actingAs($f['manager']);
        $this->getJson('/api/me/notifications')->assertOk()->assertJsonPath('notifications.total', 1);
        $exportId = $this->postJson('/api/staff/restaurants/stats-a/statistics/exports')->assertStatus(202)->json('id');
        (new BuildStatisticsExport($exportId))->handle();
        $this->getJson("/api/me/statistics/exports/{$exportId}")->assertOk()->assertJsonPath('status', 'ready');
        $this->get("/api/me/statistics/exports/{$exportId}/download")->assertOk();
        $f['manager']->restaurants()->updateExistingPivot($f['a']->id, ['is_active' => false]);
        $this->getJson('/api/me/notifications')->assertOk()->assertJsonPath('notifications.total', 0);
        $this->getJson("/api/me/statistics/exports/{$exportId}")->assertNotFound();
        Sanctum::actingAs($f['platform']);
        $this->getJson('/api/me/notifications')->assertOk()->assertJsonPath('notifications.total', 1)
            ->assertDontSee('Nom secret')->assertDontSee('Motif secret')->assertDontSee('Détail secret')
            ->assertDontSee('STATS-1')->assertDontSee('4000');
        $this->getJson("/api/me/statistics/exports/{$exportId}")->assertNotFound();
    }
}
