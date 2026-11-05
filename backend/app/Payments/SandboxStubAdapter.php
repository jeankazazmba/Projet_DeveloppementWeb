<?php

namespace App\Payments;

/** Adaptateur local sans requête réseau ni encaissement. */
class SandboxStubAdapter implements PaymentAdapter
{
    public function initialStatus(): string { return 'pending'; }
}
