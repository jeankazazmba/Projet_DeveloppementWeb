param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^\d{1,3}(\.\d{1,3}){3}$')]
  [string]$LanIp
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$env:EXPO_PUBLIC_API_URL = "http://${LanIp}:8000"
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $LanIp

Set-Location (Join-Path $root 'mobile')
Write-Host "Expo SDK 58 - API: $env:EXPO_PUBLIC_API_URL" -ForegroundColor Cyan
Write-Host "Expo Go: scan the QR code. Phone and PC must stay on the same local network."

& npx expo start --lan
if ($LASTEXITCODE -ne 0) {
  throw "Expo stopped with exit code $LASTEXITCODE."
}
