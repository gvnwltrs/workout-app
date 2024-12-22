build:
	docker build -t app-main:latest .

run-dev:
	docker image inspect app-main:dev >/dev/null 2>&1 || docker tag app-main:latest app-main:dev
	docker compose --profile app-dev up && docker compose down

run-test:
	docker image inspect app-main:dev >/dev/null 2>&1 || docker tag app-main:latest app-main:dev
	docker compose --profile app-test up && docker compose down

run-prod:
	docker image inspect app-main:latest >/dev/null 2>&1 || docker tag app-main:dev app-main:latest
	docker compose --profile default up && docker compose down

