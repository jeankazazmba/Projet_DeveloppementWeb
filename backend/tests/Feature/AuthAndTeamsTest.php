<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use App\Support\LocalAuthTokens;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthAndTeamsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    private function person(string $role, Restaurant $restaurant): User
    {
        $user = User::create(['name' => $role, 'email' => uniqid($role).'@example.test', 'password' => 'LongPassword!123']);
        $user->restaurants()->attach($restaurant->id, ['role' => $role]);
        return $user;
    }

    public function test_student_registration_login_profile_logout_and_suspension(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
        $created = $this->postJson('/api/auth/register', [
            'name' => 'Etudiante', 'email' => 'student@example.test',
            'password' => 'LongPassword!123', 'password_confirmation' => 'LongPassword!123',
            'phone' => '+243900000000', 'role' => 'admin',
        ])->assertCreated()->assertJsonPath('user.account_type', 'student')->assertJsonPath('restaurants', []);
        $user = User::where('email', 'student@example.test')->firstOrFail();
        $this->assertFalse($user->is_platform_admin);
        $this->assertDatabaseHas('student_profiles', ['user_id' => $user->id]);
        $this->withToken($created->json('token'))->getJson('/api/me')->assertOk()->assertJsonPath('phone', '+243900000000');
        $this->withToken($created->json('token'))->patchJson('/api/me', ['name' => 'Nouveau nom', 'expected_version' => 1])->assertOk()->assertJsonPath('version', 2);
        $this->withToken($created->json('token'))->patchJson('/api/me', ['name' => 'Erreur', 'expected_version' => 1])->assertStatus(409);
        $this->withToken($created->json('token'))->postJson('/api/auth/logout')->assertNoContent();
        Auth::forgetGuards();
        $this->withToken($created->json('token'))->getJson('/api/me')->assertUnauthorized();
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'LongPassword!123'])->assertOk();
        $user->update(['is_active' => false]);
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'LongPassword!123'])->assertUnprocessable();
    }

    public function test_password_reset_is_hashed_expires_and_revokes_existing_tokens(): void
    {
        $user = User::create(['name' => 'A', 'email' => 'a@example.test', 'password' => 'LongPassword!123']);
        $login = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'LongPassword!123'])->assertOk();
        $this->postJson('/api/auth/password/forgot', ['email' => $user->email])->assertOk();
        $this->postJson('/api/auth/password/forgot', ['email' => 'missing@example.test'])->assertOk();
        $this->assertDatabaseCount('password_reset_tokens', 1);
        $this->postJson('/api/auth/password/reset', ['email' => $user->email, 'token' => 'invalid', 'password' => 'NewPassword!123', 'password_confirmation' => 'NewPassword!123'])->assertUnprocessable();
        $expiredToken = str_repeat('C', 64);
        DB::table('password_reset_tokens')->where('email', $user->email)->update(['token' => hash('sha256', $expiredToken), 'created_at' => now()->subMinutes(61)]);
        $this->postJson('/api/auth/password/reset', ['email' => $user->email, 'token' => $expiredToken, 'password' => 'NewPassword!123', 'password_confirmation' => 'NewPassword!123'])->assertUnprocessable();
        // Le service expose le jeton seulement en mémoire côté serveur ; le stockage conserve son empreinte.
        $token = str_repeat('A', 64);
        DB::table('password_reset_tokens')->where('email', $user->email)->update(['token' => hash('sha256', $token), 'created_at' => now()]);
        $this->postJson('/api/auth/password/reset', ['email' => $user->email, 'token' => $token, 'password' => 'NewPassword!123', 'password_confirmation' => 'NewPassword!123'])->assertNoContent();
        Auth::forgetGuards();
        $this->withToken($login->json('token'))->getJson('/api/me')->assertUnauthorized();
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'NewPassword!123'])->assertOk();
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_email_verification_token_is_hashed_and_single_use(): void
    {
        $user = User::create(['name' => 'A', 'email' => 'a@example.test', 'password' => 'LongPassword!123']);
        LocalAuthTokens::emailVerification($user);
        $token = str_repeat('B', 64);
        DB::table('email_verification_tokens')->where('user_id', $user->id)->update(['token_hash' => hash('sha256', $token)]);
        Sanctum::actingAs($user);
        $this->postJson('/api/auth/email/verify', ['token' => $token])->assertNoContent();
        $this->postJson('/api/auth/email/verify', ['token' => $token])->assertUnprocessable();
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_local_admin_can_manage_team_with_restaurant_isolation(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A']);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B']);
        $admin = $this->person('admin', $a);
        $manager = $this->person('manager', $a);
        $other = $this->person('employee', $b);
        Sanctum::actingAs($admin);
        $this->getJson('/api/staff/restaurants/b/members')->assertNotFound();
        $this->getJson('/api/staff/restaurants/a/members')->assertOk()->assertJsonMissing(['email' => $other->email]);
        $new = $this->postJson('/api/staff/restaurants/a/members', [
            'name' => 'Employe', 'email' => 'new@example.test', 'role' => 'employee',
            'password' => 'LongPassword!123', 'password_confirmation' => 'LongPassword!123',
        ])->assertCreated()->assertJsonPath('role', 'employee');
        $id = $new->json('id');
        $this->patchJson("/api/staff/restaurants/a/members/{$id}/status", ['is_active' => false, 'reason' => 'Fin de service', 'expected_version' => 1])->assertOk()->assertJsonPath('is_active', false);
        $this->patchJson("/api/staff/restaurants/a/members/{$id}/status", ['is_active' => true, 'expected_version' => 1])->assertStatus(409);
        $this->patchJson("/api/staff/restaurants/a/members/{$id}/status", ['is_active' => true, 'expected_version' => 2])->assertOk()->assertJsonPath('is_active', true);
        $this->assertDatabaseCount('restaurant_member_audit_logs', 3);
        $this->patchJson("/api/staff/restaurants/a/members/{$other->id}/status", ['is_active' => false, 'reason' => 'Non'])->assertNotFound();
        $this->putJson("/api/staff/restaurants/a/members/{$other->id}", ['role' => 'employee'])->assertCreated()->assertJsonPath('role', 'employee');
        $this->assertDatabaseHas('restaurant_user', ['restaurant_id' => 'b', 'user_id' => $other->id, 'is_active' => true]);
        $this->getJson('/api/staff/restaurants/a/members')->assertOk()->assertJsonFragment(['email' => $manager->email]);
    }

    public function test_manager_only_manages_employees_and_platform_student_employee_are_excluded(): void
    {
        $restaurant = Restaurant::create(['id' => 'a', 'name' => 'A']);
        $manager = $this->person('manager', $restaurant);
        $employee = $this->person('employee', $restaurant);
        $admin = $this->person('admin', $restaurant);
        $platform = User::create(['name' => 'Platform', 'email' => 'platform@example.test', 'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        $student = User::create(['name' => 'Student', 'email' => 'student@example.test', 'password' => 'LongPassword!123']);
        $student->studentProfile()->create([]);
        Sanctum::actingAs($manager);
        $this->getJson('/api/staff/restaurants/a/members')->assertOk()->assertJsonMissing(['email' => $admin->email]);
        $this->postJson('/api/staff/restaurants/a/members', ['name' => 'X', 'email' => 'x@example.test', 'role' => 'manager', 'password' => 'LongPassword!123', 'password_confirmation' => 'LongPassword!123'])->assertForbidden();
        $this->putJson("/api/staff/restaurants/a/members/{$student->id}", ['role' => 'employee'])->assertForbidden();
        $this->patchJson("/api/staff/restaurants/a/members/{$admin->id}/status", ['is_active' => false, 'reason' => 'X'])->assertNotFound();
        $this->patchJson("/api/staff/restaurants/a/members/{$employee->id}/status", ['is_active' => false, 'reason' => 'X'])->assertOk();
        Sanctum::actingAs($employee);
        $this->getJson('/api/staff/restaurants/a/content')->assertNotFound();
        $this->getJson('/api/staff/restaurants/a/members')->assertNotFound();
        Sanctum::actingAs($platform);
        $this->getJson('/api/staff/restaurants/a/members')->assertForbidden();
        $this->postJson('/api/staff/restaurants/a/members', ['name' => 'X'])->assertForbidden();
        $this->postJson('/api/platform/users', ['name' => 'Admin', 'email' => 'newadmin@example.test', 'password' => 'LongPassword!123', 'restaurant_id' => 'a', 'role' => 'admin'])->assertCreated();
    }

    public function test_globally_suspended_account_is_rejected_by_all_protected_routes(): void
    {
        $restaurant = Restaurant::create(['id' => 'a', 'name' => 'A']);
        $user = $this->person('admin', $restaurant);
        $user->update(['is_active' => false]);
        Sanctum::actingAs($user);
        $this->getJson('/api/me')->assertForbidden();
        $this->getJson('/api/staff/restaurants/a/members')->assertForbidden();
    }
}
