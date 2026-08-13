#!/usr/bin/env sh
set -eu

DOMAIN="${DOMAIN:-bobrov-sexolog.ru}"
EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"

docker compose up -d nginx website

docker compose run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

echo "Certificate issued. Replace deploy/nginx/conf.d/00-bootstrap.conf with TLS config from bobrov-sexolog.ru.conf.tls.example, then:"
echo "  docker compose exec nginx nginx -s reload"
