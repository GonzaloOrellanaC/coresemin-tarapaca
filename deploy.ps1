# =============================================================================
# Deploy — Coresemin Tarapacá (PowerShell / Windows)
#
# Ejecutar desde la raíz del repo:
#     powershell -ExecutionPolicy Bypass -File .\deploy.ps1
#     (o ./deploy.ps1 si la política de ejecución lo permite)
#
# Hace: git pull -> npm install (servidor y app) -> build (servidor y app) -> pm2 restart
# =============================================================================
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "==> [1/5] Pull desde GitHub (origin/main)" -ForegroundColor Cyan
git pull origin main
if ($LASTEXITCODE -ne 0) { throw "git pull falló" }

Write-Host "==> [2/5] Instalar dependencias — servidor (raíz)" -ForegroundColor Cyan
npm install --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw "npm install (servidor) falló" }

Write-Host "==> [3/5] Instalar dependencias — app (frontend)" -ForegroundColor Cyan
Push-Location app
npm install --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw "npm install (app) falló" }
Pop-Location

Write-Host "==> [4/5] Compilar" -ForegroundColor Cyan
Write-Host "    · servidor (tsc)..."
npm run build
if ($LASTEXITCODE -ne 0) { throw "build (servidor) falló" }
Write-Host "    · app (vite build)..."
Push-Location app
npm run build
if ($LASTEXITCODE -ne 0) { throw "build (app) falló" }
Pop-Location

Write-Host "==> [5/5] Reiniciar pm2" -ForegroundColor Cyan
pm2 restart coresemin-server 2>$null
if ($LASTEXITCODE -ne 0) {
    pm2 start dist/index.js --name coresemin-server
}
pm2 restart coresemin 2>$null
pm2 save

Write-Host ""
Write-Host "Deploy completado." -ForegroundColor Green
