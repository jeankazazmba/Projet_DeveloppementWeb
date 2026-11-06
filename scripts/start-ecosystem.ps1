param(
  [ValidatePattern('^\d{1,3}(\.\d{1,3}){3}$')][string]$LanIp,
  [switch]$CheckOnly,
  [switch]$SkipMobile,
  [switch]$SkipDesktop,
  [switch]$NoBuild
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

function Require-Command([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { throw "Commande manquante : $name" }
}

Require-Command 'docker'
Require-Command 'node'
Require-Command 'npm'
if (-not $SkipDesktop) { Require-Command 'rustc' }
if (-not $SkipMobile -and -not $LanIp) {
  if ($CheckOnly) { Write-Warning 'Indiquez -LanIp pour Expo sur un téléphone physique.' }
  else { throw 'Indiquez -LanIp (adresse IPv4 du PC sur le Wi-Fi), ou utilisez -SkipMobile.' }
}

if (-not (Test-Path (Join-Path $root '.env'))) { throw 'Fichier .env racine absent. Copiez .env.example et renseignez les secrets.' }
$envPath = Join-Path $root '.env'
$envText = [System.IO.File]::ReadAllText($envPath)
if ($envText -match '(?m)^APP_KEY=[ \t]*$') {
  if ($CheckOnly) { Write-Warning 'APP_KEY est vide ; une clé sera générée lors du démarrage réel.' }
  else {
    $key = 'base64:' + [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $envText = [regex]::Replace($envText, '(?m)^APP_KEY=[ \t]*$', "APP_KEY=$key")
    [System.IO.File]::WriteAllText($envPath, $envText, [System.Text.UTF8Encoding]::new($false))
    Write-Host 'APP_KEY générée dans .env local.' -ForegroundColor Green
  }
} elseif ($envText -notmatch '(?m)^APP_KEY=\S+') { throw 'APP_KEY absent de .env.' }
if (-not (Test-Path (Join-Path $root 'mobile/node_modules')) -and -not $SkipMobile) { throw 'Dépendances Expo absentes. Exécutez npm ci dans mobile/.' }
if (-not (Test-Path (Join-Path $root 'frontend/node_modules')) -and -not $SkipDesktop) { throw 'Dépendances Tauri/Vite absentes. Exécutez npm ci dans frontend/.' }

$nodeVersion = (& node --version).Trim()
if (-not $SkipMobile -and $nodeVersion -match '^v23\.') { Write-Warning "Node $nodeVersion est installé. Préférez Node 22.13+ ou 24.3+ pour Expo SDK 58." }
& docker info --format '{{.ServerVersion}}' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Le moteur Docker ne répond pas.' }
$compose = @('compose', '-f', 'compose.yaml', '-f', 'compose.dev.yaml')
& docker @compose config --quiet
if ($LASTEXITCODE -ne 0) { throw 'La configuration Docker Compose est invalide.' }

if ($CheckOnly) {
  Write-Host 'Précontrôle terminé. Aucun serveur lancé.' -ForegroundColor Green
  exit 0
}

if (-not $NoBuild) {
  & docker @compose build backend frontend
  if ($LASTEXITCODE -ne 0) { throw 'La construction des images backend/frontend a échoué.' }
}
$up = $compose + @('up', '-d', '--no-build', 'db', 'backend', 'queue', 'frontend')
& docker @up
if ($LASTEXITCODE -ne 0) { throw "Docker Compose n'a pas démarré tous les services." }

$ready = $false
for ($attempt = 0; $attempt -lt 60; $attempt++) {
  try {
    $api = Invoke-WebRequest 'http://127.0.0.1:8000/api/ready' -TimeoutSec 3 -UseBasicParsing
    $web = Invoke-WebRequest 'http://127.0.0.1:5173/desktop.html' -TimeoutSec 3 -UseBasicParsing
    if ($api.StatusCode -eq 200 -and $web.StatusCode -eq 200 -and $web.Content.Contains('Mon Miam Miam · Bureau')) { $ready = $true; break }
  } catch { }
  Start-Sleep -Seconds 2
}
if (-not $ready) { throw 'API ou web non prêt après deux minutes. Consultez docker compose logs backend frontend.' }
& (Join-Path $PSScriptRoot 'test-ecosystem.ps1') -SkipMobile

$shell = (Get-Process -Id $PID).Path
if (-not $SkipMobile) {
  $mobile = Join-Path $PSScriptRoot 'run-mobile.ps1'
  Start-Process -FilePath $shell -ArgumentList @('-NoExit', '-File', ('"' + $mobile + '"'), '-LanIp', $LanIp) -WindowStyle Normal | Out-Null
}
if (-not $SkipDesktop) {
  $desktop = Join-Path $PSScriptRoot 'run-desktop.ps1'
  Start-Process -FilePath $shell -ArgumentList @('-NoExit', '-File', ('"' + $desktop + '"')) -WindowStyle Normal | Out-Null
}

Write-Host 'Écosystème démarré :' -ForegroundColor Green
Write-Host 'Web         http://localhost:5173/'
Write-Host 'Étudiant    http://localhost:5173/etudiant'
Write-Host 'API santé   http://localhost:8000/api/health'
Write-Host 'API prête   http://localhost:8000/api/ready'
if (-not $SkipMobile) { Write-Host "Expo        code QR dans la nouvelle fenêtre ; API http://${LanIp}:8000" }
if (-not $SkipDesktop) { Write-Host 'Bureau      fenêtre Tauri en cours de démarrage' }
Write-Host 'Pour arrêter : Ctrl+C dans les fenêtres Expo/Tauri, puis .\scripts\stop-ecosystem.ps1'
