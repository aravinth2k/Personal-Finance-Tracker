.PHONY: up down logs shell db-backup db-restore db-shell

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f backend

shell:
	docker compose exec backend sh

db-shell:
	docker compose exec postgres psql -U finance_user -d finance_db

db-backup:
	docker compose exec postgres pg_dump -U finance_user finance_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup saved."

db-restore:
ifndef FILE
	$(error Usage: make db-restore FILE=backup_20260319_120000.sql)
endif
	docker compose exec -T postgres psql -U finance_user -d finance_db < $(FILE)
	@echo "Restore complete."
