<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('app:status', function () {
    $this->info('Backend Mon Miam Miam initialisé.');
})->purpose('Afficher le statut de base du projet');
