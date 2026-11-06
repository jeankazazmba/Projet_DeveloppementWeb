<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/** Données synthétiques facultatives pour vérifier la supervision connectée. */
class PlatformRecetteSeeder extends Seeder
{
    public function run(): void
    {
        if (!app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Les agrégats de recette sont réservés aux environnements local et testing.');
        }
        $restaurants = ['khalifa-food', 'sleepy-hollow'];
        foreach ($restaurants as $restaurantId) {
            if (!DB::table('restaurants')->where('id', $restaurantId)->exists()) {
                throw new \RuntimeException("Restaurant de recette absent : {$restaurantId}. Exécuter d'abord DatabaseSeeder.");
            }
        }

        DB::transaction(function () use ($restaurants) {
            foreach ($restaurants as $index => $restaurantId) {
                foreach ([0, 1, 2] as $month) {
                    $id = sprintf('DEMO-PLATFORM-%s-%d', strtoupper($restaurantId), $month);
                    $date = now()->subMonths($month)->startOfMonth()->addDays(5 + $index);
                    DB::table('orders')->updateOrInsert(['id' => $id], [
                        'restaurant_id' => $restaurantId,
                        'customer_name' => 'Client de recette',
                        'service' => 'delivery',
                        'status' => 'paid',
                        'amount_cdf' => 4000 + ($index * 1000) + ($month * 500),
                        'is_demo' => true,
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);
                }

                $complaintId = 'DEMO-ESC-'.strtoupper($restaurantId);
                $date = now()->subDays(2 + $index);
                DB::table('complaints')->updateOrInsert(['id' => $complaintId], [
                    'restaurant_id' => $restaurantId,
                    'order_id' => null,
                    'student_name' => 'Étudiant de recette',
                    'reason' => 'Motif fictif masqué par la vue plateforme',
                    'status' => 'open',
                    'escalated' => true,
                    'is_demo' => true,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                foreach ([['credit', 120], ['debit', -30]] as [$type, $points]) {
                    $reference = "DEMO-PLATFORM-{$restaurantId}-{$type}";
                    DB::table('loyalty_movements')->updateOrInsert(['reference' => $reference], [
                        'restaurant_id' => $restaurantId,
                        'user_id' => null,
                        'points' => $points,
                        'reason' => 'Recette plateforme',
                        'is_demo' => true,
                        'created_at' => $date,
                        'updated_at' => $date,
                    ]);
                }

                DB::table('referrals')->updateOrInsert(
                    ['restaurant_id' => $restaurantId, 'status' => 'demo-platform-recette'],
                    [
                        'referrer_id' => null,
                        'referee_id' => null,
                        'rewarded_points' => 0,
                        'is_demo' => true,
                        'created_at' => $date,
                        'updated_at' => $date,
                    ],
                );
            }
        });
    }
}
