#!/usr/bin/env bash
set -euo pipefail

# ---- CONFIG ----
APP_DIR="/opt/andyamat"
SERVICE="andyamat"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== ANDYAMAT DEPLOY ==="

# ---- 1. BUILD FRONTEND ----
echo "[1/4] Building Angular frontend..."
cd "$SCRIPT_DIR/frontend"
npm ci --silent 2>&1 | tail -3
npx ng build --configuration=production 2>&1 | tail -5
echo "  Frontend built."

# ---- 2. BUILD DROGON BACKEND ----
echo "[2/4] Building Drogon backend..."
cd "$SCRIPT_DIR"
mkdir -p build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=17 2>&1 | tail -3
make -j"$(nproc)" 2>&1 | tail -5
echo "  Backend built."

# ---- 3. INSTALL ----
echo "[3/4] Installing..."
systemctl stop "$SERVICE" 2>/dev/null || true
cp "$SCRIPT_DIR/build/andyamat" "$APP_DIR/andyamat"
cp "$SCRIPT_DIR/config.json" "$APP_DIR/config.json"
rm -rf "$APP_DIR/frontend"
mkdir -p "$APP_DIR/frontend/dist/web"
cp -r "$SCRIPT_DIR/frontend/dist/web/browser" "$APP_DIR/frontend/dist/web/browser"
mkdir -p "$APP_DIR/logs"

# Patch config for production
sed -i 's/"host": "192.168.2.15"/"host": "127.0.0.1"/' "$APP_DIR/config.json"
sed -i 's/"port": 8080/"port": 8081/' "$APP_DIR/config.json"
sed -i 's/"passwd": ""/"passwd": "andyamat"/' "$APP_DIR/config.json"
echo "  Installed."

# ---- 4. RESTART ----
echo "[4/4] Restarting service..."
systemctl restart "$SERVICE"
systemctl status "$SERVICE" --no-pager | head -8
echo ""
echo "=== DEPLOYED ==="
echo "  https://andyamat.com"
