<?php

use Illuminate\Support\Facades\Artisan;
use App\Models\User;

Artisan::command('app:status', function () {
    $this->info('Backend Mon Miam Miam initialisé.');
})->purpose('Afficher le statut de base du projet');

Artisan::command('mmm:create-platform-admin {email}', function (string $email) {
    $password = $this->secret('Mot de passe du premier administrateur plateforme');
    if (!$password || strlen($password) < 12) {
        $this->error('Le mot de passe doit contenir au moins 12 caractères.');
        return;
    }
    $user = User::updateOrCreate(['email' => $email], [
        'name' => 'Administrateur plateforme',
        'password' => $password,
        'is_platform_admin' => true,
    ]);
    $this->info("Compte plateforme prêt : {$user->email}");
})->purpose('Créer le premier administrateur plateforme avec saisie interactive du mot de passe');
