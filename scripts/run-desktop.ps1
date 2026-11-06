$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location (Join-Path $root 'frontend')
Write-Host 'Tauri réutilise le site web sur http://127.0.0.1:5173.' -ForegroundColor Cyan
& npx @tauri-apps/cli@2 dev
if ($LASTEXITCODE -ne 0) { throw "Tauri a quitté avec le code $LASTEXITCODE." }
