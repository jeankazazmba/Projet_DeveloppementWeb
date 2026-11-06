<?php

use Illuminate\Support\Facades\Artisan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Database\Seeders\RecetteSeeder;
use App\Models\Restaurant;

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

Artisan::command('mmm:recette:clear', function () {
    if (!app()->environment(['local', 'testing'])) {
        $this->error('Nettoyage réservé aux environnements local et testing.');
        return 1;
    }
    try {
        DB::transaction(function () {
            foreach (RecetteSeeder::IDS as $id) {
                $restaurant = Restaurant::whereKey($id)->lockForUpdate()->first();
                if (!$restaurant) continue;
                if (!$restaurant->is_demo || !str_ends_with($restaurant->name, '· recette') || $restaurant->version !== 1) {
                    throw new \RuntimeException("Fiche non reconnue comme recette : {$id}.");
                }
                $expectedDish = $id === 'recette-khalifa' ? 'Ndolé de recette' : 'Burger de recette';
                if ($restaurant->contents()->count() !== 1
                    || !$restaurant->contents()->where('kind', 'dish')->where('title', $expectedDish)->where('version', 1)->exists()
                    || $restaurant->serviceSlots()->count() !== 7
                    || $restaurant->serviceSlots()->where('version', '!=', 1)->exists()) {
                    throw new \RuntimeException("{$id} a été modifié : nettoyage refusé.");
                }
                foreach (['orders', 'complaints', 'carts', 'restaurant_user', 'payment_intents',
                    'loyalty_movements', 'loyalty_rules', 'referrals', 'referral_codes', 'game_participations',
                    'app_notifications', 'statistic_exports', 'platform_audit_logs', 'restaurant_member_audit_logs'] as $table) {
                    if (DB::table($table)->where('restaurant_id', $id)->exists()) {
                        throw new \RuntimeException("{$id} contient des données métier ({$table}) : nettoyage refusé.");
                    }
                }
                $restaurant->delete();
            }
        });
        $this->info('Restaurants de recette supprimés. Aucune autre fiche modifiée.');
        return 0;
    } catch (\Throwable $exception) {
        $this->error($exception->getMessage());
        return 1;
    }
})->purpose('Supprimer uniquement les restaurants et contenus du seeder RecetteSeeder');

Artisan::command('mmm:recette:clear-platform', function () {
    if (!app()->environment(['local', 'testing'])) {
        $this->error('Nettoyage réservé aux environnements local et testing.');
        return 1;
    }
    DB::transaction(function () {
        DB::table('orders')->where('is_demo', true)->where('id', 'like', 'DEMO-PLATFORM-%')->delete();
        DB::table('complaints')->where('is_demo', true)->where('id', 'like', 'DEMO-ESC-%')->delete();
        DB::table('loyalty_movements')->where('is_demo', true)->where('reference', 'like', 'DEMO-PLATFORM-%')->delete();
        DB::table('referrals')->where('is_demo', true)->where('status', 'demo-platform-recette')->delete();
    });
    $this->info('Agrégats fictifs du seeder PlatformRecetteSeeder supprimés.');
    return 0;
})->purpose('Retirer seulement les agrégats fictifs du seeder PlatformRecetteSeeder');
