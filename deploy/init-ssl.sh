#!/usr/bin/env sh
# Replace temporary self-signed cert with Let's Encrypt (trusted by browsers).
set -eu

DOMAIN="${DOMAIN:-bobrov-sexolog.ru}"
EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"
ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
LIVE_DIR="$ROOT_DIR/deploy/certbot/conf/live/$DOMAIN"
ARCHIVE_DIR="$ROOT_DIR/deploy/certbot/conf/archive/$DOMAIN"

cd "$ROOT_DIR"

mkdir -p deploy/certbot/www

# Certbot needs its own live/ layout (symlinks). Remove our placeholder files first.
if [ -f "$LIVE_DIR/.selfsigned" ] || { [ -f "$LIVE_DIR/fullchain.pem" ] && [ ! -L "$LIVE_DIR/fullchain.pem" ]; }; then
  echo "Removing temporary self-signed cert so Certbot can issue a real one..."
  rm -rf "$LIVE_DIR" "$ARCHIVE_DIR"
fi

docker compose up -d nginx website

echo "Requesting Let's Encrypt certificate for $DOMAIN and www.$DOMAIN ..."
# Service entrypoint is /bin/sh (renew loop); override for one-shot issuance.
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive

docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload

echo ""
echo "OK — trusted HTTPS: https://$DOMAIN"
echo "Hard-refresh the browser (Ctrl+F5). The «Не защищено» warning should disappear."
