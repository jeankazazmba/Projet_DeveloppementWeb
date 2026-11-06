<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlatformInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_platform_admin_can_invite_and_token_is_single_use(): void
    {
        $admin = User::create(['name' => 'Plateforme', 'email' => 'admin@example.test', 'password' => 'long-password-123', 'is_platform_admin' => true]);
        $local = User::create(['name' => 'Local', 'email' => 'local@example.test', 'password' => 'long-password-123']);
        Sanctum::actingAs($local);
        $this->postJson('/api/platform/invitations', ['email' => 'invite@example.test'])->assertForbidden();

        Sanctum::actingAs($admin);
        $created = $this->postJson('/api/platform/invitations', ['email' => 'Invite@Example.Test'])->assertCreated();
        $token = $created->json('token');
        $this->assertSame(64, strlen($token));
        $this->assertDatabaseHas('platform_invitations', ['email' => 'invite@example.test', 'token_hash' => hash('sha256', $token)]);
        $this->getJson('/api/platform/invitations')->assertOk()->assertDontSee($token);

        $payload = ['token' => $token, 'name' => 'Nouvel admin', 'email' => 'invite@example.test', 'password' => 'very-long-password-123', 'password_confirmation' => 'very-long-password-123'];
        $this->postJson('/api/platform/register', $payload)->assertCreated()->assertJsonPath('user.is_platform_admin', true);
        $this->postJson('/api/platform/register', $payload)->assertUnprocessable();
        $this->assertDatabaseHas('users', ['email' => 'invite@example.test', 'is_platform_admin' => true]);
    }

    public function test_expired_or_wrong_email_invitation_cannot_create_admin(): void
    {
        $admin = User::create(['name' => 'Plateforme', 'email' => 'admin@example.test', 'password' => 'long-password-123', 'is_platform_admin' => true]);
        Sanctum::actingAs($admin);
        $token = $this->postJson('/api/platform/invitations', ['email' => 'invite@example.test'])->json('token');
        $payload = ['token' => $token, 'name' => 'Intrus', 'email' => 'wrong@example.test', 'password' => 'very-long-password-123', 'password_confirmation' => 'very-long-password-123'];
        $this->postJson('/api/platform/register', $payload)->assertUnprocessable();
        DB::table('platform_invitations')->where('email', 'invite@example.test')->update(['expires_at' => now()->subMinute()]);
        $this->postJson('/api/platform/register', [...$payload, 'email' => 'invite@example.test'])->assertUnprocessable();
    }

    public function test_platform_admin_cannot_be_assigned_as_local_admin(): void
    {
        $restaurant = Restaurant::create(['id' => 'khalifa', 'name' => 'Khalifa']);
        $admin = User::create(['name' => 'Plateforme', 'email' => 'admin@example.test', 'password' => 'long-password-123', 'is_platform_admin' => true]);
        Sanctum::actingAs($admin);
        $this->putJson("/api/platform/restaurants/{$restaurant->id}/members/{$admin->id}", ['role' => 'admin'])->assertNotFound();
    }
}
