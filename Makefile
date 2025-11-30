.PHONY: up down new new-local all all-local backend frontend seed test test-sentry


# .env fil til host (new-local)
## DB_HOST=127.0.0.1
## APP_URL=http://127.0.0.1:8000
## SESSION_DOMAIN=127.0.0.1 (eller null)
## SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost

# .env fil til Docker (new) (make new-web)
## DB_HOST=mariadb
## APP_URL=http://localhost
## SESSION_DOMAIN=localhost (eller null)
## SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost

# up: start all containers (web + mariadb + phpmyadmin)
up:
	docker-compose up -d

# down: stop and remove containers
down:
	docker-compose down

# new: første-gangs setup i Docker (DB_HOST=mariadb)
# - kør hvis du vil spejle “produktion”: miljø i containere
new: up
	docker-compose exec web composer install
	docker-compose exec web php artisan migrate --seed
	docker-compose exec web php artisan storage:link
	cd frontend && npm install

# new-local: første-gangs setup på værtsmaskinen (DB_HOST=127.0.0.1)
# - kør hvis du udvikler “på min maskine/lokalt”: backend/frontend kører direkte på host
new-local:
	docker-compose up -d mariadb
	cd backend && composer install
	cd backend && php artisan migrate --seed
	cd backend && php artisan storage:link
	cd frontend && npm install

# seed: drop + seed hurtigt (bruger nuværende .env og DB_HOST)
seed:
	cd backend && php artisan migrate:fresh --seed

# backend: start backend i forgrunden (kræver DB oppe)
backend: up
	cd backend && php artisan serve --port=8000

# frontend: start frontend i forgrunden
frontend:
	cd frontend && npm start

# all: start alt i Docker, backend i baggrund, frontend i forgrund (efter new)
all: up
	cd backend && nohup php artisan serve --port=8000 >/tmp/backend.log 2>&1 &
	@echo "Backend started on http://127.0.0.1:8000 (logs: /tmp/backend.log)"
	cd frontend && npm start

# all-local: start alt i host-mode, backend i baggrund, frontend i forgrund (efter new-local)
all-local:
	docker-compose up -d mariadb
	cd backend && nohup php artisan serve --port=8000 >/tmp/backend.log 2>&1 &
	@echo "Backend started on http://127.0.0.1:8000 (logs: /tmp/backend.log)"
	cd frontend && npm start

# test: run backend unit/integration tests (in-memory sqlite)
test:
	cd backend && php artisan test

# test-sentry: run backend tests + Sentry smoke test (requires SENTRY_LARAVEL_DSN)
test-sentry:
	cd backend && php artisan test
	cd backend && php artisan sentry:test
