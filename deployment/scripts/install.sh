#!/usr/bin/env bash
# ============================================================================
# MSK Paste – One-time server setup for Debian / Ubuntu
#
# This script prepares the server ONCE:
#   - System packages (Node.js, MariaDB, Apache, Certbot)
#   - Enable Apache modules
#   - Create MariaDB database + user
#   - Configure Apache vHost
#   - Request SSL via Let's Encrypt
#   - Prepare /opt/msk-paste/
#   - Generate .env with all secrets
#
# Code deployments are then handled exclusively by GitHub Actions
# (see .github/workflows/deploy.yml). Run this script ONCE per server.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/MSK-Scripts/msk-paste/main/deployment/scripts/install.sh \
#     | sudo bash
# ============================================================================

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────
APP_NAME="msk-paste"
APP_USER="musiker15"
APP_DIR="/opt/${APP_NAME}"
DOMAIN_DEFAULT="paste.msk-scripts.de"
NODE_VERSION="22"
NEXT_PORT="3012"
DB_NAME="msk_paste"
DB_USER="msk_paste"

# ─── Colours ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ─── Logging helpers ──────────────────────────────────────────────────
log_info() { echo -e "${BLUE}ℹ${NC}  $1"; }
log_ok()   { echo -e "${GREEN}✓${NC}  $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
log_err()  { echo -e "${RED}✗${NC}  $1" >&2; }
log_step() { echo -e "\n${BOLD}${CYAN}▶ $1${NC}\n"; }

trap 'log_err "Setup failed on line ${LINENO}."' ERR

# ============================================================================
# 0. Banner & pre-flight checks
# ============================================================================

clear
cat << "BANNER"

  ███╗   ███╗███████╗██╗  ██╗
  ████╗ ████║██╔════╝██║ ██╔╝
  ██╔████╔██║███████╗█████╔╝
  ██║╚██╔╝██║╚════██║██╔═██╗
  ██║ ╚═╝ ██║███████║██║  ██╗
  ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
            P A S T E
   One-Time Server Setup
   (Code deploy runs via GitHub Actions)

BANNER

echo -e "${DIM}Prepares the server ONCE for MSK Paste.${NC}"
echo -e "${DIM}Subsequent code updates land automatically via GitHub Actions.${NC}\n"

# Root check
if [[ $EUID -ne 0 ]]; then
    log_err "This script must be run as root (with sudo)."
    exit 1
fi

# OS check
if ! command -v apt-get &>/dev/null; then
    log_err "Only Debian / Ubuntu is supported (apt-get not found)."
    exit 1
fi

if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    log_info "Detected system: ${BOLD}${PRETTY_NAME}${NC}"
fi

# Service user check
if ! id "$APP_USER" &>/dev/null; then
    log_err "User '${APP_USER}' does not exist."
    echo "This user is also used by other MSK projects (e.g. msk-shop)."
    echo "Create it with: sudo adduser musiker15"
    exit 1
fi

# ============================================================================
# 1. Interactive prompts
# ============================================================================

log_step "1/10  Configuration"

read -rp "$(echo -e "${BOLD}Domain${NC} [${DOMAIN_DEFAULT}]: ")" DOMAIN
DOMAIN=${DOMAIN:-$DOMAIN_DEFAULT}

read -rp "$(echo -e "${BOLD}Email for Let's Encrypt${NC}: ")" LE_EMAIL
while [[ ! "$LE_EMAIL" =~ ^[^@]+@[^@]+\.[^@]+$ ]]; do
    log_err "Invalid email address"
    read -rp "Email: " LE_EMAIL
done

read -rp "$(echo -e "${BOLD}Request SSL certificate via Certbot now?${NC} (Y/n): ")" use_ssl
USE_SSL=$([[ "$use_ssl" =~ ^[nN]$ ]] && echo "no" || echo "yes")

echo ""
echo -e "${BOLD}Summary:${NC}"
echo -e "  Domain:       ${CYAN}${DOMAIN}${NC}"
echo -e "  Email (LE):   ${CYAN}${LE_EMAIL}${NC}"
echo -e "  SSL:          ${CYAN}${USE_SSL}${NC}"
echo -e "  Directory:    ${CYAN}${APP_DIR}${NC}"
echo -e "  Service user: ${CYAN}${APP_USER}${NC}"
echo ""
read -rp "Start setup now? (Y/n) " confirm
if [[ "$confirm" =~ ^[nN]$ ]]; then
    echo "Aborted."
    exit 0
fi

# ============================================================================
# 2. Update system packages
# ============================================================================

log_step "2/10  Updating system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -qq -y
log_ok "System is up to date"

# ============================================================================
# 3. Install base tools
# ============================================================================

log_step "3/10  Installing base tools"
apt-get install -qq -y \
    curl wget git ca-certificates gnupg lsb-release \
    openssl ufw
log_ok "Base tools installed"

# ============================================================================
# 4. Install Node.js
# ============================================================================

log_step "4/10  Installing Node.js ${NODE_VERSION}"
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 22 ]]; then
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - >/dev/null
    apt-get install -qq -y nodejs
fi
log_ok "Node.js $(node -v), npm $(npm -v) installed"

# ============================================================================
# 5. Install MariaDB
# ============================================================================

log_step "5/10  Installing MariaDB"
apt-get install -qq -y mariadb-server mariadb-client
systemctl enable --now mariadb
log_ok "MariaDB running"

# ============================================================================
# 6. Install Apache2 + Certbot
# ============================================================================

log_step "6/10  Installing Apache2 & Certbot"
apt-get install -qq -y apache2 certbot python3-certbot-apache

a2enmod proxy        >/dev/null 2>&1 || true
a2enmod proxy_http   >/dev/null 2>&1 || true
a2enmod ssl          >/dev/null 2>&1 || true
a2enmod headers      >/dev/null 2>&1 || true
a2enmod rewrite      >/dev/null 2>&1 || true
a2enmod deflate      >/dev/null 2>&1 || true

systemctl enable apache2
log_ok "Apache2 ready with all modules"

# ============================================================================
# 7. Set up database
# ============================================================================

log_step "7/10  Setting up MariaDB database"

DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=\n' | cut -c1-24)
IP_HASH_SECRET=$(openssl rand -hex 32)

mariadb << SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP USER IF EXISTS '${DB_USER}'@'localhost';
CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

log_ok "Database '${DB_NAME}' and user '${DB_USER}' created"

# ============================================================================
# 8. Prepare directory & .env
# ============================================================================

log_step "8/10  Preparing directory & .env"

mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"

cat > "$APP_DIR/.env" << ENV
# Auto-generated by install.sh – $(date)
NODE_ENV=production
PORT=${NEXT_PORT}

NEXT_PUBLIC_BASE_URL=https://${DOMAIN}

DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

IP_HASH_SECRET=${IP_HASH_SECRET}

RATE_LIMIT_CREATE_PER_HOUR=10
MAX_PASTE_SIZE_BYTES=1048576
PASTE_ID_LENGTH=8
PASTE_ID_MIN_CUSTOM=4
PASTE_ID_MAX_CUSTOM=32
ENV

chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"
log_ok ".env created (chmod 600)"

# ============================================================================
# 9. Configure Apache vhost
# ============================================================================

log_step "9/10  Configuring Apache vhost"

cat > /etc/apache2/sites-available/msk-paste.conf << APACHE
<VirtualHost *:80>
    ServerName ${DOMAIN}
    ServerAdmin webmaster@${DOMAIN}

    # Reverse proxy to Next.js (port ${NEXT_PORT})
    ProxyPreserveHost   On
    ProxyRequests       Off
    ProxyTimeout        60

    ProxyPass        / http://127.0.0.1:${NEXT_PORT}/
    ProxyPassReverse / http://127.0.0.1:${NEXT_PORT}/

    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Host  "%{HTTP_HOST}e"
    RequestHeader set X-Real-IP         "%{REMOTE_ADDR}s"

    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript
        AddOutputFilterByType DEFLATE application/javascript application/json
        AddOutputFilterByType DEFLATE image/svg+xml
    </IfModule>

    ErrorLog  \${APACHE_LOG_DIR}/msk-paste-error.log
    CustomLog \${APACHE_LOG_DIR}/msk-paste-access.log combined
    LogLevel warn
</VirtualHost>
APACHE

a2ensite msk-paste >/dev/null 2>&1
apache2ctl configtest >/dev/null
systemctl reload apache2
log_ok "Apache2 vhost enabled"

if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
    ufw allow 'Apache Full' >/dev/null
    log_ok "UFW: ports 80 + 443 opened"
fi

# ============================================================================
# 10. SSL via Let's Encrypt (optional)
# ============================================================================

log_step "10/10  SSL certificate"

if [[ "$USE_SSL" == "yes" ]]; then
    log_info "Requesting Let's Encrypt certificate for ${DOMAIN}…"
    if certbot --apache --non-interactive \
        --agree-tos --email "$LE_EMAIL" \
        --redirect --no-eff-email \
        -d "$DOMAIN"; then
        log_ok "SSL active – HTTPS enforced"
    else
        log_warn "Certbot failed. Manual run:"
        echo "  sudo certbot --apache -d ${DOMAIN}"
    fi
else
    log_info "SSL skipped – run later with: sudo certbot --apache -d ${DOMAIN}"
fi

# ============================================================================
# Done!
# ============================================================================

echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║         Server setup completed successfully!          ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}🚀 Next steps:${NC}"
echo ""
echo "1. Configure your GitHub repository with these ${BOLD}Secrets${NC}:"
echo "   (Settings → Secrets and variables → Actions)"
echo ""
echo -e "   ${CYAN}FTP_SERVER${NC}           = IP/hostname of this server"
echo -e "   ${CYAN}FTP_USERNAME${NC}         = root (deploy runs as root)"
echo -e "   ${CYAN}FTP_PORT${NC}             = 22 (or your SSH port)"
echo -e "   ${CYAN}SSH_PRIVATE_KEY${NC}      = private key matching root authorized_keys"
echo -e "   ${CYAN}NEXT_PUBLIC_BASE_URL${NC} = https://${DOMAIN}"
echo ""
echo "2. Push to 'main' → GitHub Actions deploys automatically."
echo ""
echo -e "${BOLD}📁 Important paths:${NC}"
echo "   App:    ${APP_DIR}"
echo "   Config: ${APP_DIR}/.env"
echo "   Apache: /etc/apache2/sites-available/msk-paste.conf"
echo ""
echo -e "${BOLD}🔧 Useful commands (after first deploy):${NC}"
echo "   Service status:  systemctl status msk-paste"
echo "   Service logs:    journalctl -u msk-paste -f"
echo "   Service restart: systemctl restart msk-paste"
echo "   Backup:          sudo bash ${APP_DIR}/deployment/scripts/backup.sh"
echo ""
echo -e "${BOLD}🔐 Generated secrets (also stored in ${APP_DIR}/.env):${NC}"
echo -e "   DB_PASSWORD     = ${DB_PASSWORD}"
echo -e "   IP_HASH_SECRET  = ${IP_HASH_SECRET}"
echo ""
echo -e "${YELLOW}⚠  Store these values securely!${NC}"
echo ""
