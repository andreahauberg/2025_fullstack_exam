# Twitter Fullstack Exam – Setup Guide

## Repo structure
- `backend/` – Laravel API (Sanctum auth, MySQL/MariaDB)
- `frontend/` – React client (npm start on :3000)
- `docker-compose.yml` – web (php-fpm/nginx), mariadb, phpmyadmin
- `Makefile` – shortcuts for setup, start, reseed

## Prereqs
- Docker + Docker Compose (for mariadb/phpmyadmin and optional web)
- PHP + Composer (for host-mode)
- Node.js + npm

## .env (backend)
Use **one** of these depending on mode:

Host-mode (php artisan serve, DB via 127.0.0.1):
```
DB_HOST=127.0.0.1
APP_URL=http://127.0.0.1:8000
SESSION_DOMAIN=127.0.0.1
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost
```

Docker web-mode (everything in containers):
```
DB_HOST=mariadb
APP_URL=http://localhost
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost
```
Other .env keys (DB_DATABASE/DB_USERNAME/DB_PASSWORD etc.) already match docker-compose defaults.

## Make targets
- `make new`        – first-time setup in Docker (composer, migrate --seed, storage:link, npm install)
- `make new-local`  – first-time setup on host (mariadb container only, composer, migrate --seed, storage:link, npm install)
- `make all`        – start containers + backend (bg) + frontend (fg) after `make new`
- `make all-local`  – start mariadb + backend (bg) + frontend (fg) after `make new-local`
- `make seed`       – `php artisan migrate:fresh --seed` (uses current .env)
- `make backend`    – start backend in foreground (needs DB up)
- `make frontend`   – start frontend in foreground
- `make up/down`    – start/stop containers (web + mariadb + phpmyadmin)

## Seeding notes
- Users/posts/comments/likes/follows are fake data.
- Posts seeder uses picsum URLs for images; no storage link needed for these URLs, but `php artisan storage:link` is still required for uploaded files.

## phpMyAdmin
- Runs on http://localhost:8080 when containers are up.
- Host: `mariadb`, user: `root`, password: `password`.

## Typical workflows
**Fresh start (host-mode):**
```
make new-local
make all-local
```

**Fresh start (docker web-mode):**
```
make new
make all
```

**Reseed after changes:**
```
make seed
```

## API / Frontend
- Backend serves on :8000 (host-mode) or :80 mapped to localhost:80 (docker web).
- Frontend runs on :3000 (`npm start`). Ensure CORS/Sanctum domains match your chosen mode.
- OpenAPI docs: `backend/public/openapi.yaml` (import into Swagger UI/Insomnia/Postman or open in https://editor.swagger.io and set server to your backend URL).

## Troubleshooting
- 500 with `posts.deleted_at` missing: run `php artisan migrate:fresh --seed` to apply latest migrations (posts uses soft deletes).
- Missing images: picsum URLs are remote; if offline, posts fall back to no image.
- DB connection issues: verify `.env` DB_HOST matches mode and that mariadb container is running (`docker ps`). 
