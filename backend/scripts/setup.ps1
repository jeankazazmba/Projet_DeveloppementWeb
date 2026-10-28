# Installation locale du backend Mon Miam Miam.
# Exécuter depuis le dossier backend : .\scripts\setup.ps1

$ErrorActionPreference = "Stop"

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    throw "PHP est introuvable. Installer PHP 8.2+ et l'ajouter au PATH."
}

if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    throw "Composer est introuvable. Installer Composer 2 avant de continuer."
}

Write-Host "PHP :"
php -v

Write-Host "Composer :"
composer --version

Write-Host "Installation des dépendances..."
composer install --no-interaction

if ($LASTEXITCODE -ne 0) {
    throw "L'installation Composer a échoué."
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Fichier .env créé à partir de .env.example."
}

Write-Host "Génération de la clé d'application..."
php artisan key:generate --no-interaction

if ($LASTEXITCODE -ne 0) {
    throw "La génération de la clé a échoué."
}

Write-Host "Nettoyage du cache de configuration..."
php artisan config:clear

Write-Host "Installation terminée. Démarrer l'API avec : php artisan serve"
Write-Host "Tester ensuite : http://127.0.0.1:8000/api/health"
Write-Host "MySQL doit être configuré séparément dans .env pour les fonctions de base de données."
