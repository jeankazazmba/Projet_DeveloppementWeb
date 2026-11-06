$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
& docker compose -f compose.yaml -f compose.dev.yaml down
if ($LASTEXITCODE -ne 0) { throw 'Arrêt Docker Compose incomplet.' }
Write-Host 'Conteneurs arrêtés ; les données MySQL restent dans leur volume.' -ForegroundColor Green
