<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Les services métier seront enregistrés ici au fil des sprints.
    }

    public function boot(): void
    {
        // Pas de configuration globale supplémentaire pour le socle.
    }
}
