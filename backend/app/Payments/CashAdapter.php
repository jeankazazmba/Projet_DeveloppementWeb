<?php

namespace App\Payments;

class CashAdapter implements PaymentAdapter
{
    public function initialStatus(): string { return 'cash_due'; }
}
