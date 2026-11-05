<?php

namespace App\Exceptions;

use RuntimeException;

/** Refus ou panne renvoyé par Supabase Auth ; conserve le code HTTP pour distinguer identifiants invalides et panne. */
class AuthProviderException extends RuntimeException
{
    public function __construct(string $message, public readonly int $providerStatus = 0)
    {
        parent::__construct($message);
    }

    /** Vrai si Supabase a refusé la demande (identifiants/jeton invalides), faux si c'est une panne côté fournisseur. */
    public function isClientRefusal(): bool
    {
        return in_array($this->providerStatus, [400, 401, 403, 422], true);
    }
}
