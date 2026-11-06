<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;

/** Comptes et données exclusivement réservés à une démonstration locale. */
class PresentationSeeder extends Seeder
{
    public function run(): void
    {
        if (!app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Les comptes de présentation sont réservés aux environnements local et testing.');
        }

        $this->call([DatabaseSeeder::class, RecetteSeeder::class, PlatformRecetteSeeder::class]);
        $password = 'Presentation!2026';
        $accounts = [
            ['name' => 'Amina Étudiante', 'email' => 'etudiant.presentation@monmiammiam.test', 'student' => true],
            ['name' => 'Éric Employé', 'email' => 'employe.presentation@monmiammiam.test', 'restaurant' => 'khalifa-food', 'role' => 'employee'],
            ['name' => 'Grâce Gérante', 'email' => 'gerant.presentation@monmiammiam.test', 'restaurant' => 'khalifa-food', 'role' => 'manager'],
            ['name' => 'Alain Admin restaurant', 'email' => 'admin.presentation@monmiammiam.test', 'restaurant' => 'khalifa-food', 'role' => 'admin'],
            ['name' => 'Patricia Plateforme', 'email' => 'plateforme.presentation@monmiammiam.test', 'platform' => true],
        ];

        foreach ($accounts as $account) {
            $user = User::updateOrCreate(['email' => $account['email']], [
                'name' => $account['name'], 'password' => $password, 'is_active' => true,
                'is_platform_admin' => $account['platform'] ?? false, 'email_verified_at' => now(),
            ]);
            if ($account['student'] ?? false) $user->studentProfile()->updateOrCreate([], ['phone' => '+243 810 000 001']);
            if (isset($account['restaurant'])) {
                $user->restaurants()->syncWithoutDetaching([$account['restaurant'] => ['role' => $account['role'], 'is_active' => true, 'version' => 1]]);
            }
        }

        foreach (['khalifa-food', 'sleepy-hollow'] as $restaurantId) {
            $restaurant = Restaurant::findOrFail($restaurantId);
            $restaurant->update(['delivery_fee_cdf' => 1000]);
            foreach (range(0, 6) as $weekday) {
                $restaurant->serviceSlots()->updateOrCreate(['service' => 'pickup', 'weekday' => $weekday, 'starts_at' => '08:00:00'], ['ends_at' => '22:00:00', 'is_active' => true]);
                $restaurant->serviceSlots()->updateOrCreate(['service' => 'delivery', 'weekday' => $weekday, 'starts_at' => '09:00:00'], ['ends_at' => '20:00:00', 'is_active' => true]);
                $restaurant->serviceSlots()->updateOrCreate(['service' => 'dine_in', 'weekday' => $weekday, 'starts_at' => '08:00:00'], ['ends_at' => '21:00:00', 'is_active' => true]);
            }
            $restaurant->diningTables()->updateOrCreate(['code' => 'T-01'], ['capacity' => 4, 'is_active' => true]);
            $restaurant->deliveryZones()->updateOrCreate(['district' => 'Gombe'], ['fee_cdf' => 1000, 'is_active' => true]);
        }
    }
}
