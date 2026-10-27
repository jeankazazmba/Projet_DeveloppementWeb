# Vérifications rapides à effectuer après installation.
$ErrorActionPreference = "Stop"

if (-not (Test-Path "vendor/autoload.php")) {
    throw "Dépendances absentes : exécuter .\scripts\setup.ps1"
}

Write-Host "Liste des routes API :"
php artisan route:list --path=api

if ($LASTEXITCODE -ne 0) {
    throw "Impossible de charger les routes Laravel."
}

Write-Host "Tests :"
php artisan test

if ($LASTEXITCODE -ne 0) {
    throw "Les tests ont échoué."
}

Write-Host "Test HTTP (nécessite php artisan serve dans un autre terminal) :"
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 5

    if ($response.status -ne "ok") {
        throw "Réponse API inattendue."
    }

    Write-Host "API accessible : $($response.application)"
} catch {
    Write-Warning "Serveur non accessible sur le port 8000. Lancer php artisan serve."
}
