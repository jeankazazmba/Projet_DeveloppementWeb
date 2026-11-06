@echo off
set "RULE=Mon Miam Miam Expo Metro LAN"
set "COMMAND=New-NetFirewallRule -DisplayName '%RULE%' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8081 -Profile Private"
powershell.exe -NoProfile -Command "Start-Process powershell.exe -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command ""%COMMAND%""'"
echo.
echo Accept the Windows administrator prompt, then restart Expo and scan its QR code in Expo Go.
pause
