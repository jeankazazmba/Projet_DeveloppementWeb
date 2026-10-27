<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
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
}
