<?php

namespace App\Providers;

use App\Models\Complaint;
use App\Policies\ComplaintPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Les services métier seront enregistrés ici au fil des sprints.
    }

    public function boot(): void
    {
        Gate::policy(Complaint::class, ComplaintPolicy::class);
    }
}
