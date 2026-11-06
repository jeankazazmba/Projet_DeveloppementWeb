<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/** Données isolées, déterministes et supprimables pour la recette locale. */
class RecetteSeeder extends Seeder
{
    public const IDS = ['recette-khalifa', 'recette-sleepy'];

    public function run(): void
    {
        if (!app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Le seeder de recette est réservé aux environnements local et testing.');
        }

        DB::transaction(function () {
            foreach ([
                ['recette-khalifa', 'Khalifa_food · recette', 'Ndolé de recette', 3000],
                ['recette-sleepy', 'sleepy hollow · recette', 'Burger de recette', 4200],
            ] as [$id, $name, $dish, $price]) {
                $restaurant = Restaurant::find($id);
                if ($restaurant && (!$restaurant->is_demo || $restaurant->name !== $name)) {
                    throw new \RuntimeException("Identifiant de recette déjà occupé : {$id}.");
                }
                $restaurant ??= Restaurant::create([
                    'id' => $id, 'name' => $name, 'location' => 'Kinshasa, RDC',
                    'hours' => 'Recette locale : 11h–20h', 'description' => 'Données fictives de recette.',
                    'status' => 'active', 'is_public' => true, 'is_demo' => true,
                ]);
                $restaurant->contents()->firstOrCreate(
                    ['kind' => 'dish', 'title' => $dish],
                    ['description' => 'Plat fictif de recette.', 'price_cdf' => $price,
                        'is_published' => true, 'is_available' => true],
                );
                for ($day = 0; $day < 7; $day++) {
                    $restaurant->serviceSlots()->firstOrCreate(
                        ['service' => 'pickup', 'weekday' => $day, 'starts_at' => '11:00:00'],
                        ['ends_at' => '20:00:00', 'is_active' => true],
                    );
                }
            }
        });
    }
}
