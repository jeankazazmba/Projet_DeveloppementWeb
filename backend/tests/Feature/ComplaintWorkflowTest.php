<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ComplaintWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function student(string $email): User
    {
        $user = User::create(['name' => $email, 'email' => $email, 'password' => 'LongPassword!123']);
        $user->studentProfile()->create([]);
        return $user;
    }

    private function staff(Restaurant $restaurant, string $role): User
    {
        $user = User::create(['name' => $role, 'email' => uniqid($role).'@example.test', 'password' => 'LongPassword!123']);
        $user->restaurants()->attach($restaurant->id, ['role' => $role]);
        return $user;
    }

    public function test_complaint_roles_visibility_and_platform_projection(): void
    {
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $b = Restaurant::create(['id' => 'b', 'name' => 'B', 'status' => 'active', 'is_public' => true]);
        $student = $this->student('student@example.test'); $other = $this->student('other@example.test');
        $employee = $this->staff($a, 'employee'); $manager = $this->staff($a, 'manager'); $admin = $this->staff($a, 'admin');
        Sanctum::actingAs($student);
        $id = $this->postJson('/api/restaurants/a/complaints', ['reason' => 'Commande arrivée incomplète'])->assertCreated()->assertJsonPath('status', 'ouverte')->json('id');
        $this->postJson("/api/me/complaints/{$id}/messages", ['body' => 'Il manque le plat principal'])->assertCreated();
        $this->getJson("/api/me/complaints/{$id}")->assertOk()->assertJsonCount(1, 'messages');
        Sanctum::actingAs($other);
        $this->getJson("/api/me/complaints/{$id}")->assertNotFound();
        $this->postJson("/api/me/complaints/{$id}/messages", ['body' => 'Intrus'])->assertNotFound();
        $this->getJson('/api/me/complaints')->assertOk()->assertJsonPath('total', 0);
        Sanctum::actingAs($this->staff($b, 'employee'));
        $this->getJson("/api/staff/restaurants/a/complaints/{$id}")->assertNotFound();
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'prise_en_charge', 'expected_version' => 1])->assertNotFound();
        Sanctum::actingAs($employee);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'decision_admin', 'expected_version' => 1])->assertStatus(409);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'prise_en_charge', 'expected_version' => 1])->assertOk()->assertJsonPath('version', 2);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'proposition_employe', 'expected_version' => 1, 'body' => 'Réponse interne'])->assertStatus(409);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'proposition_employe', 'expected_version' => 2])->assertUnprocessable();
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'proposition_employe', 'expected_version' => 2, 'body' => 'Réponse interne'])->assertOk()->assertJsonPath('version', 3);
        Sanctum::actingAs($student);
        $this->getJson("/api/me/complaints/{$id}")->assertOk()->assertJsonCount(1, 'messages')->assertJsonMissing(['body' => 'Réponse interne']);
        Sanctum::actingAs($manager);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'prise_en_charge', 'expected_version' => 3])->assertUnprocessable();
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'prise_en_charge', 'expected_version' => 3, 'reason' => 'Préciser la réponse'])->assertOk()->assertJsonPath('version', 4);
        Sanctum::actingAs($employee);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'proposition_employe', 'expected_version' => 4, 'body' => 'Nouvelle réponse interne'])->assertOk()->assertJsonPath('version', 5);
        Sanctum::actingAs($manager);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'validation_gerant', 'expected_version' => 5])->assertOk()->assertJsonPath('version', 6);
        Sanctum::actingAs($admin);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'decision_admin', 'expected_version' => 6, 'body' => 'Nous corrigeons la commande.'])->assertOk()->assertJsonPath('version', 7);
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'escaladee', 'expected_version' => 7])->assertUnprocessable();
        $this->patchJson("/api/staff/complaints/{$id}/status", ['status' => 'escaladee', 'expected_version' => 7, 'reason' => 'Arbitrage réseau nécessaire'])->assertOk()->assertJsonPath('version', 8);
        $this->assertDatabaseHas('complaint_events', ['complaint_id' => $id, 'to_status' => 'escaladee', 'complaint_version' => 8]);
        Sanctum::actingAs($student);
        $this->getJson("/api/me/complaints/{$id}")->assertOk()->assertJsonCount(2, 'messages')->assertJsonMissing(['body' => 'Nouvelle réponse interne'])->assertDontSee('Préciser la réponse');
        $this->postJson("/api/me/complaints/{$id}/messages", ['body' => 'Encore'])->assertNotFound();
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);
        $this->getJson('/api/platform/complaint-escalations')->assertOk()->assertJsonPath('data.0.id', $id)
            ->assertJsonMissingPath('data.0.reason')->assertJsonMissingPath('data.0.student_name')->assertDontSee('Commande arrivée incomplète');
        $this->getJson("/api/staff/restaurants/a/complaints/{$id}")->assertForbidden();
        $this->getJson("/api/me/complaints/{$id}")->assertForbidden();
    }

    public function test_private_attachments_require_authorized_user_and_short_signed_url(): void
    {
        Storage::fake('local');
        $a = Restaurant::create(['id' => 'a', 'name' => 'A', 'status' => 'active', 'is_public' => true]);
        $student = $this->student('student@example.test'); $other = $this->student('other@example.test');
        $employee = $this->staff($a, 'employee');
        Sanctum::actingAs($student);
        $id = $this->postJson('/api/restaurants/a/complaints', ['reason' => 'Produit incorrect reçu'])->assertCreated()->json('id');
        $attachment = $this->postJson("/api/complaints/{$id}/attachments", ['file' => UploadedFile::fake()->create('preuve.pdf', 10, 'application/pdf')])->assertCreated()->assertJsonMissingPath('path')->json('id');
        $url = $this->getJson("/api/complaints/{$id}/attachments/{$attachment}/url")->assertOk()->json('url');
        $path = parse_url($url, PHP_URL_PATH).'?'.parse_url($url, PHP_URL_QUERY);
        $this->get($path)->assertOk();
        $this->travel(6)->minutes();
        $this->get($path)->assertForbidden();
        $this->travelBack();
        $this->getJson("/api/complaints/{$id}/attachments/{$attachment}/url")->assertOk();
        Sanctum::actingAs($other);
        $this->getJson("/api/complaints/{$id}/attachments/{$attachment}/url")->assertNotFound();
        $this->get($path)->assertForbidden();
        Sanctum::actingAs($employee);
        $internal = $this->postJson("/api/complaints/{$id}/attachments", ['file' => UploadedFile::fake()->create('interne.pdf', 10, 'application/pdf')])->assertCreated()->json('id');
        $this->getJson("/api/complaints/{$id}/attachments/{$internal}/url")->assertOk();
        Sanctum::actingAs($student);
        $this->getJson("/api/me/complaints/{$id}")->assertOk()->assertJsonCount(1, 'attachments');
        $this->getJson("/api/complaints/{$id}/attachments/{$internal}/url")->assertNotFound();
        $platform = User::create(['name' => 'Plateforme', 'email' => 'platform@example.test', 'password' => 'LongPassword!123', 'is_platform_admin' => true]);
        Sanctum::actingAs($platform);
        $this->getJson("/api/complaints/{$id}/attachments/{$attachment}/url")->assertForbidden();
    }
}
