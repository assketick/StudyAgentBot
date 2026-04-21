.PHONY: run up-db migrate up down logs

install-uv:
	curl -LsSf https://astral.sh/uv/install.sh | sh

up-db:
	docker-compose up -d --build postgres

wait-db:
	@echo "Waiting for Postgres..."
	@until docker-compose exec postgres sh -c 'pg_isready -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'; do \
		sleep 2; \
	done
	@echo "Postgres is ready"

migrate:
	uv run alembic upgrade head

up:
	docker-compose up -d n8n

run: up-db wait-db migrate up
	@echo "🚀 All services are up"

down:
	docker-compose down
