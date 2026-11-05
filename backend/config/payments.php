<?php

return [
    'sandbox_enabled' => env('PAYMENT_SANDBOX_ENABLED', false),
    'test_webhook_secret' => env('PAYMENT_WEBHOOK_TEST_SECRET'),
    'webhook_tolerance_seconds' => 300,
];
