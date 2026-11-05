<?php

use Illuminate\Support\Facades\Artisan;
use App\Models\User;
use Illuminate\Support\Facades\DB;

Artisan::command('app:status', function () {
    $this->info('Backend Mon Miam Miam initialisé.');
})->purpose('Afficher le statut de base du projet');

Artisan::command('mmm:create-platform-admin {email}', function (string $email) {
    $email = mb_strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error('Adresse e-mail invalide.');
        return;
    }
    if (User::where('email', $email)->exists()) {
        $this->error('Ce compte existe déjà. Aucun droit ni mot de passe n’a été modifié.');
        return;
    }
    $password = $this->secret('Mot de passe du premier administrateur plateforme');
    if (!$password || strlen($password) < 12) {
        $this->error('Le mot de passe doit contenir au moins 12 caractères.');
        return;
    }
    $user = DB::transaction(function () use ($email, $password) {
        $user = User::create([
            'email' => $email,
            'name' => 'Administrateur plateforme',
            'password' => $password,
            'is_platform_admin' => true,
        ]);
        DB::table('platform_audit_logs')->insert([
            'actor_id' => null, 'action' => 'platform.bootstrap_admin_created',
            'target_type' => 'user', 'target_id' => (string) $user->id,
            'reason' => 'Création depuis la console serveur',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        return $user;
    });
    $this->info("Compte plateforme prêt : {$user->email}");
})->purpose('Créer le premier administrateur plateforme avec saisie interactive du mot de passe');

Artisan::command('mmm:reset-platform-password {email}', function (string $email) {
    $user = User::where('email', mb_strtolower(trim($email)))->where('is_platform_admin', true)->first();
    if (!$user) {
        $this->error('Compte administrateur plateforme introuvable.');
        return;
    }
    $password = $this->secret('Nouveau mot de passe');
    if (!$password || strlen($password) < 12) {
        $this->error('Le mot de passe doit contenir au moins 12 caractères.');
        return;
    }
    DB::transaction(function () use ($user, $password) {
        $user->update(['password' => $password]);
        $user->tokens()->delete();
        DB::table('platform_audit_logs')->insert([
            'actor_id' => null, 'action' => 'platform.password_reset_cli',
            'target_type' => 'user', 'target_id' => (string) $user->id,
            'reason' => 'Réinitialisation depuis la console serveur',
            'created_at' => now(), 'updated_at' => now(),
        ]);
    });
    $this->info('Mot de passe modifié. Toutes les sessions existantes ont été révoquées.');
})->purpose('Récupérer un accès plateforme depuis la console serveur');
