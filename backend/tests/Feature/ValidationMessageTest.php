<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ValidationMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_confirmation_uses_a_readable_api_message(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Jean Kaz',
            'email' => 'jean@example.test',
            'password' => 'LongPassword!123',
            'password_confirmation' => 'DifferentPassword!123',
        ])->assertUnprocessable()
            ->assertJsonPath('error.code', 'validation_failed')
            ->assertJsonPath('error.details.password.0', 'La confirmation du mot de passe ne correspond pas.');
    }
}
