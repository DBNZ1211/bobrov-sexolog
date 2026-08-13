#!/usr/bin/env sh
set -eu

DOMAIN="${DOMAIN:-bobrov-sexolog.ru}"
EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"
ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
TLS_EXAMPLE="$ROOT_DIR/deploy/nginx/conf.d/01-tls.conf.example"
TLS_ACTIVE="$ROOT_DIR/deploy/nginx/conf.d/01-tls.conf"
BOOTSTRAP="$ROOT_DIR/deploy/nginx/conf.d/00-bootstrap.conf"

docker compose up -d nginx website

docker compose run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

cp "$TLS_EXAMPLE" "$TLS_ACTIVE"
# HTTP-only bootstrap would conflict with TLS :80 redirects
rm -f "$BOOTSTRAP"

docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload

echo "TLS enabled. Site: https://$DOMAIN"
