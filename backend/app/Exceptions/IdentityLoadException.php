<?php

namespace App\Exceptions;

use RuntimeException;

/** Profil ou affectations illisibles : problème de RLS, de trigger ou de colonnes, pas une erreur de l'utilisateur. */
class IdentityLoadException extends RuntimeException
{
}
