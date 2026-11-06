param([switch]$SkipMobile, [switch]$ExternalWeb)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

$running = @(& docker compose -f compose.yaml -f compose.dev.yaml ps --status running --services)
if ($LASTEXITCODE -ne 0) { throw 'Impossible de lire les services Docker.' }
$requiredServices = if ($ExternalWeb) { @('db', 'backend', 'queue') } else { @('db', 'backend', 'queue', 'frontend') }
foreach ($service in $requiredServices) {
  if ($service -notin $running) { throw "Service arrêté ou absent : $service" }
}

$checks = @(
  @{ Name = 'API santé'; Url = 'http://127.0.0.1:8000/api/health'; Match = $null },
  @{ Name = 'API et MySQL prêts'; Url = 'http://127.0.0.1:8000/api/ready'; Match = $null },
  @{ Name = 'Catalogue restaurants'; Url = 'http://127.0.0.1:8000/api/restaurants'; Match = $null },
  @{ Name = 'Site web'; Url = 'http://127.0.0.1:5173/'; Match = 'Mon Miam Miam' },
  @{ Name = 'Entrée bureau'; Url = 'http://127.0.0.1:5173/desktop.html'; Match = 'Mon Miam Miam · Bureau' }
)
foreach ($check in $checks) {
  $response = Invoke-WebRequest $check.Url -TimeoutSec 10 -UseBasicParsing
  if ($response.StatusCode -ne 200 -or ($check.Match -and -not $response.Content.Contains($check.Match))) {
    throw "Échec du contrôle : $($check.Name)"
  }
  Write-Host "OK — $($check.Name)" -ForegroundColor Green
}

if (-not $SkipMobile) {
  $metro = Invoke-WebRequest 'http://127.0.0.1:8081/status' -TimeoutSec 10 -UseBasicParsing
  if ($metro.StatusCode -ne 200 -or -not $metro.Content.Contains('packager-status:running')) { throw 'Expo Metro ne répond pas.' }
  Write-Host 'OK — Expo Metro' -ForegroundColor Green
}

Write-Host 'Contrôles réseau réussis. Vérifiez encore les parcours avec de vrais comptes dans le navigateur, Tauri et Expo.' -ForegroundColor Cyan
