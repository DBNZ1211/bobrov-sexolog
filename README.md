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
| `ADMIN_USER` / `ADMIN_PASSWORD` | доступ в админку |
| `SESSION_SECRET` | подпись cookie-сессии |
| `DATA_DIR` | каталог SQLite и загрузок (по умолчанию `./data`) |
| `NUXT_PUBLIC_PHONE` | телефон на сайте |
| `DOMAIN` / `CERTBOT_EMAIL` | для Docker / Let's Encrypt |

## Docker

```bash
cp .env.example .env
# заполните ADMIN_*, SESSION_SECRET, DOMAIN, CERTBOT_EMAIL
docker compose up -d --build
```

Первый SSL-сертификат (DNS A-запись уже на сервер):

```bash
sh deploy/init-ssl.sh
```

Затем замените HTTP-конфиг на TLS:

```bash
cp deploy/nginx/conf.d/bobrov-sexolog.ru.conf.tls.example deploy/nginx/conf.d/01-tls.conf
rm deploy/nginx/conf.d/00-bootstrap.conf
docker compose exec nginx nginx -s reload
```

Certbot в compose периодически делает `renew`.

## Контент

Профиль врача редактируется в админке (`/admin/profile`); seed — `shared/doctorSeed.ts`.  
Документы (PDF/DOCX/изображения) — `/admin/documents`, публичная страница `/dokumenty`.  
Превью PDF/DOCX в Docker: `poppler-utils` + LibreOffice; локально без них — placeholder PNG.  
Фото героя — `public/images/`.
