<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_health_returns_expected_json(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertOk();

        $response->assertJson([
            'status' => 'ok',
            'application' => 'Mon Miam Miam',
            'service' => 'backend',
        ]);
    }

    public function test_readiness_requires_database_and_schema_without_exposing_connection_details(): void
    {
        $ready = $this->getJson('/api/ready')->assertOk()->assertJsonPath('status', 'ready');
        $this->assertStringContainsString('no-store', $ready->headers->get('Cache-Control'));
        Schema::shouldReceive('hasTable')->andReturn(false);
        $this->getJson('/api/ready')->assertStatus(503)->assertJsonPath('status', 'unavailable')
            ->assertDontSee('database');
        $this->getJson('/api/health')->assertOk();
    }

    public function test_request_id_is_returned_and_invalid_header_is_replaced(): void
    {
        $this->withHeader('X-Request-ID', 'recette-123456')->getJson('/api/health')
            ->assertOk()->assertHeader('X-Request-ID', 'recette-123456');
        $response = $this->withHeader('X-Request-ID', "invalid\nheader")->getJson('/api/health')->assertOk();
        $this->assertNotEquals("invalid\nheader", $response->headers->get('X-Request-ID'));
    }

    public function test_production_rejects_plain_http_when_https_is_required(): void
    {
        config()->set('app.env', 'production');
        config()->set('operations.require_https', true);
        $this->withServerVariables(['HTTPS' => 'off', 'SERVER_PORT' => 80])
            ->getJson('http://localhost/api/health')->assertStatus(426)->assertJsonPath('error.code', 'https_required');
        $this->withServerVariables(['HTTPS' => 'on', 'SERVER_PORT' => 443])
            ->getJson('https://localhost/api/health')->assertOk();
    }

    public function test_cors_allows_only_configured_browser_origin(): void
    {
        config()->set('cors.allowed_origins', ['https://app.example.test']);
        config()->set('cors.supports_credentials', false);
        $allowed = $this->withHeaders(['Origin' => 'https://app.example.test',
            'Access-Control-Request-Method' => 'GET'])->optionsJson('/api/restaurants');
        $allowed->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'https://app.example.test');
        $blocked = $this->withHeaders(['Origin' => 'https://other.example.test',
            'Access-Control-Request-Method' => 'GET'])->optionsJson('/api/restaurants');
        $this->assertNotEquals('https://other.example.test', $blocked->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_structured_request_event_uses_route_template_without_query_values(): void
    {
        Log::spy();
        $this->getJson('/api/health?secret=NE_JAMAIS_JOURNALISER')->assertOk();
        Log::shouldHaveReceived('info')->with('http.request', \Mockery::on(function ($fields) {
            return $fields['route'] === 'api/health' && $fields['method'] === 'GET'
                && $fields['status'] === 200 && !str_contains(json_encode($fields), 'NE_JAMAIS_JOURNALISER');
        }))->once();
    }
}
