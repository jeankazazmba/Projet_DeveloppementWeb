#!/usr/bin/env bash
# Installation locale du backend Mon Miam Miam.
# Depuis backend : bash scripts/setup.sh

set -euo pipefail

command -v php >/dev/null || { echo "PHP 8.2+ est requis."; exit 1; }
command -v composer >/dev/null || { echo "Composer 2 est requis."; exit 1; }

php -v
composer --version

composer install --no-interaction

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Fichier .env créé."
fi

php artisan key:generate --no-interaction
php artisan config:clear

echo "Installation terminée."
echo "Lancer : php artisan serve"
echo "Tester : http://127.0.0.1:8000/api/health"
echo "Configurer MySQL séparément dans .env."
