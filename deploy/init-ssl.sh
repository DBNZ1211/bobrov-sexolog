#!/usr/bin/env sh
set -eu

DOMAIN="${DOMAIN:-bobrov-sexolog.ru}"
EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"
ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

sh deploy/ensure-certs.sh
docker compose up -d nginx website

docker compose run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal

docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload

echo "Let's Encrypt TLS active. Site: https://$DOMAIN"
