# Сайт-визитка — Бобров Василий Тихонович

Nuxt 4 + Tailwind. SQLite (`data/site.db`: лиды, профиль, документы), админка `/admin`, деплой: Docker Compose (website + nginx + certbot).

## Локальный запуск

```bash
cp .env.example .env
# задайте ADMIN_PASSWORD и SESSION_SECRET
pnpm install
pnpm dev
```

Сайт: http://localhost:3000  
Админка: http://localhost:3000/admin/login

Нужен Node.js 22+ (рекомендуется 24). Для SQLite используется встроенный модуль `node:sqlite` — при необходимости:

```bash
set NODE_OPTIONS=--experimental-sqlite
pnpm dev
```

(в Linux/macOS: `export NODE_OPTIONS=--experimental-sqlite`)

## Переменные окружения

См. `.env.example`:

| Переменная | Назначение |
|---|---|
| `ADMIN_USER` / `ADMIN_PASSWORD` | доступ в админку (в Docker пробрасываются как `NUXT_ADMIN_*`) |
| `SESSION_SECRET` | подпись cookie-сессии (в Docker — `NUXT_SESSION_SECRET`) |
| `DATA_DIR` | каталог SQLite и загрузок (по умолчанию `./data`) |
| `NUXT_PUBLIC_SITE_URL` | канонический URL (sitemap, OG, JSON-LD) |
| `NUXT_PUBLIC_PHONE` | телефон на сайте |
| `DOMAIN` / `CERTBOT_EMAIL` | для Docker / Let's Encrypt |

## Docker

```bash
cp .env.example .env
# заполните ADMIN_*, SESSION_SECRET, DOMAIN, CERTBOT_EMAIL
docker compose up -d --build
```

Первый SSL (DNS A на сервер, открыты порты 80 и 443):

```bash
set -a && . ./.env && set +a
sh deploy/ensure-certs.sh   # :443 сразу (self-signed, если LE ещё нет)
docker compose up -d nginx website
sh deploy/init-ssl.sh       # настоящий Let's Encrypt
```

`ensure-certs.sh` нужен, чтобы nginx слушал **443** до выпуска LE. Certbot в compose потом делает `renew`.

## Контент

Профиль врача редактируется в админке (`/admin/profile`); seed — `shared/doctorSeed.ts`.  
Документы (PDF/DOCX/изображения) — `/admin/documents`, публичная страница `/dokumenty`.  
Превью PDF/DOCX в Docker: `poppler-utils` + LibreOffice; локально без них — placeholder PNG.  
Фото героя — `public/images/`.
