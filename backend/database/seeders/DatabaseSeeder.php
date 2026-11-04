<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $zeduc = Restaurant::updateOrCreate(['id' => 'zeduc'], [
            'name' => 'ZeDuc-Sp@ce',
            'location' => 'Kinshasa, RDC · adresse exacte à confirmer',
            'hours' => 'Horaires à confirmer',
            'description' => 'Cuisine congolaise, terrasse et espace étudiant.',
            'is_public' => true,
        ]);
        $partner = Restaurant::updateOrCreate(['id' => 'partenaire-demo'], [
            'name' => 'Restaurant partenaire (exemple)',
            'location' => 'Kinshasa, RDC · localisation à renseigner',
            'hours' => 'Horaires à renseigner',
            'description' => 'Fiche de démonstration pour préparer plusieurs établissements.',
            'is_public' => true,
            'is_demo' => true,
        ]);
        foreach ([
            ['kind' => 'dish', 'title' => 'Poulet DG Royal', 'description' => 'Poulet, plantains et légumes.', 'price_cdf' => 3500, 'details' => ['category' => 'Plats']],
            ['kind' => 'dish', 'title' => 'Poisson braisé', 'description' => 'Poisson grillé et bobolo.', 'price_cdf' => 4500, 'details' => ['category' => 'Grillades']],
            ['kind' => 'promotion', 'title' => 'Offre Duo Grillades', 'description' => 'Grillades à partager et boissons.', 'details' => ['badge' => '−15 %', 'terms' => 'Offre indicative à confirmer.']],
            ['kind' => 'event', 'title' => 'Tournoi de billard ZeDuc Cup', 'description' => 'Compétition amicale.', 'details' => ['place' => 'Espace Billard & Lounge', 'day' => '07', 'month' => 'NOV', 'time' => '16h00']],
            ['kind' => 'game', 'title' => 'Roue gourmande', 'description' => 'Jeu informatif. Récompenses réelles à confirmer.'],
        ] as $item) {
            $zeduc->contents()->updateOrCreate(['kind' => $item['kind'], 'title' => $item['title']], [...$item, 'is_published' => true]);
        }
        foreach ([
            ['title' => 'Assiette du partenaire (exemple)', 'description' => 'Article fictif pour tester le parcours multi-restaurants.', 'price_cdf' => 4500, 'details' => ['category' => 'Plats']],
            ['title' => 'Boisson du partenaire (exemple)', 'description' => 'Article fictif pour tester le changement de restaurant.', 'price_cdf' => 2000, 'details' => ['category' => 'Boissons']],
        ] as $item) {
            $partner->contents()->updateOrCreate(['kind' => 'dish', 'title' => $item['title']], ['kind' => 'dish', ...$item, 'is_published' => true]);
        }
    }
}
