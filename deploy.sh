#!/usr/bin/env bash
# =============================================================================
# Deploy — Coresemin Tarapacá (server Express + app React/Vite)
#
# Ejecutar en el servidor, desde la raíz del repo:
#     bash deploy.sh          (o ./deploy.sh si tiene permiso de ejecución)
#
# Hace: git pull → npm install (servidor y app) → build (servidor y app) → pm2 restart
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==> [1/5] Pull desde GitHub (origin/main)"
git pull origin main

echo "==> [2/5] Instalar dependencias — servidor (raíz)"
npm install --ignore-scripts

echo "==> [3/5] Instalar dependencias — app (frontend)"
( cd app && npm install --ignore-scripts )

echo "==> [4/5] Compilar"
echo "    · servidor (tsc)..."
npm run build
echo "    · app (vite build)..."
( cd app && npm run build )

echo "==> [5/5] Reiniciar pm2"
if pm2 pid coresemin-server >/dev/null 2>&1; then
  pm2 restart coresemin-server
else
  pm2 start dist/index.js --name coresemin-server
fi
# Reiniciar también el proceso de la app (modo dev) si existe
if pm2 pid coresemin >/dev/null 2>&1; then
  pm2 restart coresemin
fi
pm2 save

echo ""
echo "✅ Deploy completado."
pm2 list
