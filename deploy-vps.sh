#!/usr/bin/env bash
# =============================================================================
# deploy-vps.sh — деплой uni-proxy на Contabo VPS
# Запускать С ЛОКАЛЬНОЙ МАШИНЫ:  bash deploy-vps.sh
# =============================================================================
set -euo pipefail

# ── Настройки ────────────────────────────────────────────────────────────────
VPS_IP="217.76.49.47"
VPS_USER="root"
VPS_PASS="BIBIBIBABABAXUI"
DOMAIN="proxy.uni.ai"            # должен указывать A-записью на ${VPS_IP}
APP_DIR="/root/uni-proxy"

# ── Заполни ключи ─────────────────────────────────────────────────────────────
OPENAI_API_KEY=""                # sk-...
ELEVENLABS_API_KEY=""            # ключ из elevenlabs.io
ELEVENLABS_VOICE_ID=""           # ID голоса из ElevenLabs dashboard
# ─────────────────────────────────────────────────────────────────────────────

# Генерируем INTERNAL_API_KEY на лету
INTERNAL_API_KEY=$(python3 -c "import uuid; print(uuid.uuid4())" 2>/dev/null \
  || node -e "const {v4}=require('uuid');console.log(v4())" 2>/dev/null \
  || cat /proc/sys/kernel/random/uuid)

echo "▶ INTERNAL_API_KEY: ${INTERNAL_API_KEY}"
echo "  (сохрани — понадобится для GitHub Secrets как NEXT_PUBLIC_PROXY_KEY)"
echo ""

# ── Проверяем sshpass ─────────────────────────────────────────────────────────
if ! command -v sshpass &>/dev/null; then
  echo "Устанавливаю sshpass..."
  if command -v apt-get &>/dev/null; then
    sudo apt-get install -y sshpass
  elif command -v brew &>/dev/null; then
    brew install hudochenkov/sshpass/sshpass
  else
    echo "❌ Установи sshpass вручную и запусти снова"; exit 1
  fi
fi

SSH="sshpass -p ${VPS_PASS} ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP}"
SCP="sshpass -p ${VPS_PASS} scp -o StrictHostKeyChecking=no -r"

# ── 1. Устанавливаем Node.js 22 LTS ──────────────────────────────────────────
echo "▶ [1/7] Устанавливаем Node.js 22..."
$SSH 'bash -s' <<'REMOTE'
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node --version
npm --version
REMOTE

# ── 2. Устанавливаем pm2, nginx, certbot ─────────────────────────────────────
echo "▶ [2/7] Устанавливаем PM2, Nginx, Certbot..."
$SSH 'bash -s' <<'REMOTE'
npm install -g pm2
apt-get install -y nginx certbot python3-certbot-nginx
nginx -v
pm2 --version
REMOTE

# ── 3. Копируем proxy-backend на VPS ─────────────────────────────────────────
echo "▶ [3/7] Копируем proxy-backend..."
# Определяем путь к скрипту и репозиторию
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
$SSH "rm -rf ${APP_DIR} && mkdir -p ${APP_DIR}"
$SCP "${SCRIPT_DIR}/proxy-backend/." "${VPS_USER}@${VPS_IP}:${APP_DIR}/"

# ── 4. Устанавливаем зависимости и билдим ────────────────────────────────────
echo "▶ [4/7] npm install && npm run build..."
$SSH "cd ${APP_DIR} && npm install && npm run build"

# ── 5. Создаём .env ───────────────────────────────────────────────────────────
echo "▶ [5/7] Создаём .env..."
$SSH "cat > ${APP_DIR}/.env" <<ENVFILE
INTERNAL_API_KEY=${INTERNAL_API_KEY}
ALLOWED_ORIGIN=https://uni.ai

OPENAI_API_KEY=${OPENAI_API_KEY}

ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
ELEVENLABS_VOICE_ID=${ELEVENLABS_VOICE_ID}

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=20

PORT=3001
NODE_ENV=production
ENVFILE

# ── 6. Запускаем через PM2 ────────────────────────────────────────────────────
echo "▶ [6/7] Запускаем PM2..."
$SSH "cd ${APP_DIR} && pm2 delete uni-proxy 2>/dev/null || true && pm2 start ecosystem.config.js && pm2 save && pm2 startup | tail -1 | bash || true"
$SSH "pm2 status"

# ── 7. Nginx + Let's Encrypt ──────────────────────────────────────────────────
echo "▶ [7/7] Настраиваем Nginx + SSL..."
$SSH "cat > /etc/nginx/sites-available/uni-proxy" <<NGINXCONF
server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size 12M;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_buffering off;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001;
    }
}
NGINXCONF

$SSH "ln -sf /etc/nginx/sites-available/uni-proxy /etc/nginx/sites-enabled/uni-proxy \
  && nginx -t \
  && systemctl reload nginx"

# Let's Encrypt (нужно чтобы DNS proxy.uni.ai → 217.76.49.47 уже работал)
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Убедись что DNS: ${DOMAIN} → ${VPS_IP}"
echo "  Затем выполни на VPS:"
echo "  certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos -m admin@uni.ai"
echo "══════════════════════════════════════════════════════════"
echo ""

# ── Финальный smoke-тест ──────────────────────────────────────────────────────
echo "▶ Smoke-тест /health..."
sleep 2
$SSH "curl -s http://localhost:3001/health"
echo ""
echo ""
echo "✅ Деплой завершён!"
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  Добавь в GitHub Secrets (Settings → Secrets → Actions):"
echo "  NEXT_PUBLIC_PROXY_URL  = https://${DOMAIN}"
echo "  NEXT_PUBLIC_PROXY_KEY  = ${INTERNAL_API_KEY}"
echo "══════════════════════════════════════════════════════════"
