<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $samples = [
            [
                'id' => 'khalifa-food', 'name' => 'Khalifa_food',
                'location' => 'Kinshasa, RDC · adresse à confirmer',
                'hours' => 'Horaires de démonstration · 11h–21h',
                'description' => 'Cuisine généreuse et plats chauds pour les étudiants.',
                'contents' => [
                    ['kind' => 'dish', 'title' => 'Ndolé aux crevettes fraîches et plantains', 'description' => 'Ndolé, crevettes et plantains vapeur.', 'price_cdf' => 3000, 'details' => ['category' => 'Plats']],
                    ['kind' => 'dish', 'title' => 'Poisson braisé entier au feu de bois', 'description' => 'Poisson grillé et bobolo.', 'price_cdf' => 4420, 'details' => ['category' => 'Grillades']],
                    ['kind' => 'dish', 'title' => 'Poulet DG Royal en portion individuelle', 'description' => 'Poulet, plantains et légumes.', 'price_cdf' => 3500, 'details' => ['category' => 'Plats']],
                    ['kind' => 'dish', 'title' => 'Brochettes de crevettes géantes de la RDC', 'description' => 'Crevettes grillées aux herbes.', 'price_cdf' => 4000, 'details' => ['category' => 'Grillades']],
                    ['kind' => 'dish', 'title' => 'Brochettes de bœuf marinées aux épices', 'description' => 'Bœuf braisé et épices du Nord.', 'price_cdf' => 1500, 'details' => ['category' => 'Grillades']],
                    ['kind' => 'dish', 'title' => 'Riz sauté spécial chef au poulet', 'description' => 'Riz sauté, poulet et légumes.', 'price_cdf' => 2500, 'details' => ['category' => 'Plats']],
                    ['kind' => 'dish', 'title' => 'Beignets-haricots chauds', 'description' => 'Beignets dorés et haricots.', 'price_cdf' => 500, 'details' => ['category' => 'Plats']],
                    ['kind' => 'dish', 'title' => 'Jus de gingembre frais et menthe', 'description' => 'Gingembre et menthe fraîche.', 'price_cdf' => 1000, 'details' => ['category' => 'Boissons']],
                    ['kind' => 'dish', 'title' => 'Jus de bissap glacé à la vanille', 'description' => 'Hibiscus et vanille.', 'price_cdf' => 1000, 'details' => ['category' => 'Boissons']],
                    ['kind' => 'promotion', 'title' => 'Offre Duo Grillades', 'description' => 'Grillades à partager et boissons.', 'details' => ['badge' => '−15 %', 'terms' => 'Offre de démonstration.']],
                    ['kind' => 'event', 'title' => 'Tournoi de billard Khalifa Cup', 'description' => 'Compétition amicale.', 'details' => ['place' => 'Khalifa_food', 'day' => '01', 'month' => 'NOV', 'time' => '16h00']],
                    ['kind' => 'game', 'title' => 'Roue gourmande', 'description' => 'Une tentative quotidienne et des points de démonstration.', 'details' => ['type' => 'wheel']],
                    ['kind' => 'game', 'title' => 'Quiz gourmand', 'description' => 'Quel plat est servi chez Khalifa_food ?', 'details' => ['type' => 'quiz', 'questions' => [
                        ['question' => 'Quel plat associe poulet et plantains ?', 'options' => ['Poulet DG', 'Bissap', 'Beignets'], 'answer' => 0],
                    ]]],
                    ['kind' => 'game', 'title' => 'Paires gourmandes', 'description' => 'Retrouvez les paires de plats.', 'details' => ['type' => 'memory', 'pairs' => ['Poulet DG', 'Ndolé', 'Poisson braisé']]],
                ],
            ],
            [
                'id' => 'sleepy-hollow', 'name' => 'sleepy hollow',
                'location' => 'Kinshasa, RDC · adresse à confirmer',
                'hours' => 'Horaires de démonstration · 12h–22h',
                'description' => 'Pause gourmande, grillades et boissons fraîches.',
                'contents' => [
                    ['kind' => 'dish', 'title' => 'Burger nocturne sleepy hollow', 'description' => 'Burger de bœuf et sauce maison.', 'price_cdf' => 4200, 'details' => ['category' => 'Plats']],
                    ['kind' => 'dish', 'title' => 'Brochettes du soir', 'description' => 'Brochettes grillées et légumes.', 'price_cdf' => 3200, 'details' => ['category' => 'Grillades']],
                    ['kind' => 'dish', 'title' => 'Limonade gingembre et menthe', 'description' => 'Gingembre frais et menthe.', 'price_cdf' => 1500, 'details' => ['category' => 'Boissons']],
                    ['kind' => 'dish', 'title' => 'Douceur mangue', 'description' => 'Dessert fruité à la mangue.', 'price_cdf' => 2500, 'details' => ['category' => 'Desserts']],
                    ['kind' => 'promotion', 'title' => 'Duo du soir sleepy hollow', 'description' => 'Deux assiettes de brochettes à partager.', 'details' => ['badge' => '−10 %', 'terms' => 'Offre de démonstration.']],
                    ['kind' => 'promotion', 'title' => 'Pause fraîche sleepy hollow', 'description' => 'Une limonade avec une formule du soir.', 'details' => ['badge' => 'Boisson offerte', 'terms' => 'Offre de démonstration.']],
                    ['kind' => 'event', 'title' => 'Soirée jeux sleepy hollow', 'description' => 'Quiz et plats à partager.', 'details' => ['place' => 'sleepy hollow', 'day' => '14', 'month' => 'NOV', 'time' => '19h30']],
                    ['kind' => 'game', 'title' => 'Roue Sleepy', 'description' => 'Une tentative quotidienne pour ce restaurant.', 'details' => ['type' => 'wheel']],
                    ['kind' => 'game', 'title' => 'Quiz Sleepy', 'description' => 'Découvrez la carte de sleepy hollow.', 'details' => ['type' => 'quiz', 'questions' => [
                        ['question' => 'Quel plat est servi chez sleepy hollow ?', 'options' => ['Burger nocturne sleepy hollow', 'Poulet DG Royal', 'Ndolé'], 'answer' => 0],
                    ]]],
                    ['kind' => 'game', 'title' => 'Paires Sleepy', 'description' => 'Retrouvez les paires du restaurant.', 'details' => ['type' => 'memory', 'pairs' => ['Burger nocturne sleepy hollow', 'Brochettes du soir', 'Limonade gingembre et menthe']]],
                ],
            ],
        ];

        foreach ($samples as $sample) {
            $restaurant = Restaurant::updateOrCreate(['id' => $sample['id']], [
                'name' => $sample['name'], 'location' => $sample['location'],
                'hours' => $sample['hours'], 'description' => $sample['description'],
                'is_public' => true, 'is_demo' => true,
            ]);
            foreach ($sample['contents'] as $content) {
                $restaurant->contents()->updateOrCreate(
                    ['kind' => $content['kind'], 'title' => $content['title']],
                    [...$content, 'is_published' => true],
                );
            }
        }

        // Masquer les anciennes fiches de démonstration sans effacer de données.
        Restaurant::whereIn('id', ['zeduc', 'partenaire-demo'])->update(['is_public' => false]);
    }
}
