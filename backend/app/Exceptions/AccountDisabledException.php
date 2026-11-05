<?php

namespace App\Exceptions;

use RuntimeException;

/** Le compte existe mais profiles.account_status n'est pas « active ». */
class AccountDisabledException extends RuntimeException
{
}
