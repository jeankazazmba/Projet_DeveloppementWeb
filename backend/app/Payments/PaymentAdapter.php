<?php

namespace App\Payments;

interface PaymentAdapter
{
    public function initialStatus(): string;
}
