#!/usr/bin/env bash
set -euo pipefail

# ---- CONFIG ----
VPS="root@144.91.75.151"
APP_DIR="/opt/andyamat"
SERVICE="andyamat"
DOMAIN="andyamat.com"
DROGON_PORT=8081
DB_NAME="andyamat"
DB_USER="andyamat"
DB_PASS="andyamat"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== ANDYAMAT VPS SETUP ==="

# ---- 1. CREATE DATABASE ----
echo "[1/5] Setting up PostgreSQL..."
ssh "$VPS" "bash -s" <<DBEOF
  set -e
  # Create user if not exists
  sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"

  # Create database if not exists
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

  # Grant privileges
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
  echo "  Database ready."
DBEOF

# ---- 2. RUN SCHEMA ----
echo "[2/5] Running schema..."
scp "$SCRIPT_DIR/sql/schema.sql" "$VPS:/tmp/andyamat_schema.sql"
# Remove CREATE DATABASE and \c lines (db already exists)
ssh "$VPS" "sed -i '/^CREATE DATABASE/d; /^\\\\c/d' /tmp/andyamat_schema.sql && PGPASSWORD=$DB_PASS psql -h 127.0.0.1 -U $DB_USER -d $DB_NAME -f /tmp/andyamat_schema.sql 2>&1 || echo '  (Tables may already exist, continuing...)'"

# ---- 3. INSTALL ANGULAR CLI ----
echo "[3/5] Installing Angular CLI on VPS..."
ssh "$VPS" "npm list -g @angular/cli 2>/dev/null | grep -q angular || npm install -g @angular/cli 2>&1 | tail -3; echo '  Angular CLI ready.'"

# ---- 4. CREATE SYSTEMD SERVICE ----
echo "[4/5] Creating systemd service..."
ssh "$VPS" "cat > /etc/systemd/system/$SERVICE.service" <<SVCEOF
[Unit]
Description=Andy Amat Baby Shower App
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/andyamat
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SVCEOF
ssh "$VPS" "systemctl daemon-reload && systemctl enable $SERVICE"
echo "  Service created and enabled."

# ---- 5. NGINX + SSL ----
echo "[5/5] Configuring nginx..."
ssh "$VPS" "cat >> /etc/nginx/sites-enabled/proxy" <<'NGXEOF'

# Andy Amat Baby Shower
server {
    listen 80;
    listen [::]:80;
    server_name andyamat.com www.andyamat.com;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGXEOF

ssh "$VPS" "nginx -t 2>&1 && systemctl reload nginx && echo '  Nginx configured.'"

echo ""
echo "=== SETUP COMPLETE ==="
echo ""
echo "Next steps:"
echo "  1. Point andyamat.com DNS A record to 144.91.75.151"
echo "  2. Run: certbot --nginx -d andyamat.com -d www.andyamat.com"
echo "  3. Run: ./deploy.sh   (to build and deploy the app)"
echo ""
echo "Default admin login: admin / changeme"
