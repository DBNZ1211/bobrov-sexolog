#!/usr/bin/env sh
# Ensure TLS material exists so nginx can bind :443.
# Uses Let's Encrypt files if present; otherwise creates a self-signed cert.
set -eu

DOMAIN="${DOMAIN:-bobrov-sexolog.ru}"
ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
LIVE_DIR="$ROOT_DIR/deploy/certbot/conf/live/$DOMAIN"
FULLCHAIN="$LIVE_DIR/fullchain.pem"
PRIVKEY="$LIVE_DIR/privkey.pem"

mkdir -p "$LIVE_DIR" "$ROOT_DIR/deploy/certbot/www"

if [ -f "$FULLCHAIN" ] && [ -f "$PRIVKEY" ]; then
  echo "TLS certs OK: $LIVE_DIR"
  exit 0
fi

echo "No Let's Encrypt cert yet — generating self-signed for https://$DOMAIN (:443)"
openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
  -keyout "$PRIVKEY" \
  -out "$FULLCHAIN" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN"

chmod 600 "$PRIVKEY"
chmod 644 "$FULLCHAIN"
echo "Self-signed cert written. Run deploy/init-ssl.sh for a real Let's Encrypt certificate."
