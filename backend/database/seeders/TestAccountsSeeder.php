<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestAccountsSeeder extends Seeder
{
    public function run(): void
    {
        if (!app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Comptes de test réservés à local et testing.');
        }
        Restaurant::findOrFail('khalifa-food');
        DB::transaction(function () {
            foreach (['etudiant' => 'student', 'employe' => 'employee', 'gerant' => 'manager', 'admin' => 'admin', 'plateforme' => 'platform'] as $label => $role) {
                $user = User::firstOrNew(['email' => $label.'@monmiammiam.test']);
                $user->forceFill([
                    'name' => ucfirst($label).' Test',
                    'password' => 'MiamTest!2026',
                    'is_active' => true,
                    'is_platform_admin' => $role === 'platform',
                    'email_verified_at' => now(),
                ])->save();
                if ($role === 'student') {
                    $user->studentProfile()->firstOrCreate([]);
                } elseif ($role !== 'platform') {
                    $user->restaurants()->syncWithoutDetaching([
                        'khalifa-food' => ['role' => $role, 'is_active' => true, 'version' => 1],
                    ]);
                }
            }
        });
    }
}
