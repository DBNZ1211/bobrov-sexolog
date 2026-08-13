#!/usr/bin/env sh
# Ensure TLS material exists so nginx can bind :443.
# Prefer existing Let's Encrypt; otherwise create a temporary self-signed cert.
set -eu

DOMAIN="${DOMAIN:-bobrov-sexolog.ru}"
ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
LIVE_DIR="$ROOT_DIR/deploy/certbot/conf/live/$DOMAIN"
FULLCHAIN="$LIVE_DIR/fullchain.pem"
PRIVKEY="$LIVE_DIR/privkey.pem"
MARKER="$LIVE_DIR/.selfsigned"

mkdir -p "$LIVE_DIR" "$ROOT_DIR/deploy/certbot/www"

# Let's Encrypt uses symlinks under live/; leave them alone.
if [ -L "$FULLCHAIN" ] && [ -L "$PRIVKEY" ]; then
  echo "Let's Encrypt certs OK: $LIVE_DIR"
  exit 0
fi

if [ -f "$FULLCHAIN" ] && [ -f "$PRIVKEY" ]; then
  echo "Self-signed (or local) certs present: $LIVE_DIR"
  echo "Browser will show «Не защищено» until you run: sh deploy/init-ssl.sh"
  exit 0
fi

echo "No TLS cert yet — generating temporary self-signed for https://$DOMAIN (:443)"
openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
  -keyout "$PRIVKEY" \
  -out "$FULLCHAIN" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN"

chmod 600 "$PRIVKEY"
chmod 644 "$FULLCHAIN"
touch "$MARKER"

echo "Temporary cert ready. Site works on https:// but is NOT trusted by browsers."
echo "Issue a real certificate: set -a && . ./.env && set +a && sh deploy/init-ssl.sh"
