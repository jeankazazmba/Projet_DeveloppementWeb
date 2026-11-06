<?php

return [
    'require_https' => (bool) env('APP_REQUIRE_HTTPS', false),
    // Ne choisir * que si PHP-FPM est inaccessible directement depuis Internet.
    'trusted_proxies' => env('TRUSTED_PROXIES', ''),
];
