param(
  [string]$LanIp,
  [switch]$NoBuild
)

$ErrorActionPreference = 'Stop'

function Get-LanIp {
  $configuration = Get-NetIPConfiguration | Where-Object {
    $_.IPv4Address -and $_.IPv4DefaultGateway -and $_.IPv4Address.IPAddress -notmatch '^(127|169\.254)\.'
  } | Select-Object -First 1

  return $configuration.IPv4Address.IPAddress
}

try {
  if (-not $LanIp) { $LanIp = Get-LanIp }
  if (-not $LanIp) {
    Write-Host 'Impossible de détecter l’adresse Wi-Fi/LAN de ce PC.' -ForegroundColor Yellow
    $LanIp = Read-Host 'Saisissez l’adresse IPv4 du PC (exemple : 192.168.1.20)'
  }
  if ($LanIp -notmatch '^\d{1,3}(\.\d{1,3}){3}$') { throw 'Adresse IPv4 invalide.' }

  Write-Host "Démarrage de Mon Miam Miam avec Expo sur $LanIp…" -ForegroundColor Cyan
  $arguments = @{ LanIp = $LanIp }
  if ($NoBuild) { $arguments.NoBuild = $true }
  & (Join-Path $PSScriptRoot 'start-ecosystem.ps1') @arguments
} catch {
  Write-Host "`nÉchec du lancement : $($_.Exception.Message)" -ForegroundColor Red
  Write-Host 'Vérifiez Docker Desktop, les dépendances Node et la connexion réseau, puis relancez ce fichier.' -ForegroundColor Yellow
}

Write-Host "`nCette fenêtre peut être fermée après le démarrage. Les fenêtres Expo et Tauri restent ouvertes." -ForegroundColor DarkGray
Read-Host 'Appuyez sur Entrée pour fermer'
