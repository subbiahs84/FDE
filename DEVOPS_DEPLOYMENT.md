# Meridian local deployment and operations

## Application summary

- **Architecture:** Java 21, Spring Boot 3.3, Maven, Spring MVC, Spring Data JPA, MySQL 8.4, Spring Retry, Jakarta Validation, and Micrometer/Actuator.
- **Layers:** controllers and DTOs, application services, classifier, repositories, JPA entities, configuration, and exception handling.
- **Database:** MySQL database `pocdb`, application user `pocuser`, persistent named volume `mysql-data`. `schema.sql` creates the tables and indexes; `data.sql` seeds classification mappings and demonstration attempts during application startup.
- **External integration:** none. Retry requests are stored for a report-runner handoff; they do not execute report generation.
- **Ports:** API 8080, MySQL 3306, Adminer 8081. Compose binds each to loopback only.
- **Configuration:** `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `MAX_RETRIES`, and `PORT`. Compose supplies the database configuration. Spring's SQL initializer is enabled.
- **Profiles:** the default application profile and an isolated test profile using H2.
- **Health and metrics:** `/actuator/health`, `/actuator/prometheus`, and `/api/metrics`.

## Prerequisites and build

Install Docker Desktop for Windows and ensure its Linux engine is running. The Docker build uses Maven with Eclipse Temurin 21 and packages the application in a multi-stage image.

Optional local Maven verification, if Maven 3.9+ and JDK 21 are installed:

```powershell
mvn test
mvn -DskipTests package
```

The equivalent CMD commands are:

```cmd
mvn test
mvn -DskipTests package
```

The Docker image build runs the Maven package phase; it does not rely on a locally installed Maven.

## Deploy on Windows Docker Desktop

From the project root in PowerShell:

```powershell
.\deploy.ps1
```

The script creates a Git-ignored `.env` containing randomly generated database passwords if one does not already exist, then runs `docker compose up --build --detach`. The secrets are not printed. Retain this file while the MySQL volume exists: MySQL initializes its accounts only when the data directory is first created.

Equivalent manual PowerShell commands:

```powershell
$bytes = New-Object byte[] 32
$rng = New-Object Security.Cryptography.RNGCryptoServiceProvider
$rng.GetBytes($bytes)
$dbPassword = [BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$rng.Dispose()
$rootPassword = [BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()
$lines = @("DB_PASSWORD=$dbPassword", "MYSQL_ROOT_PASSWORD=$rootPassword")
[IO.File]::WriteAllLines((Join-Path $PWD ".env"), $lines, (New-Object Text.UTF8Encoding($false)))
docker compose up --build --detach
```

Equivalent CMD commands after creating `.env` with the two required keys:

```cmd
docker compose up --build --detach
docker compose ps
```

No separate database setup command is required for this Compose deployment. The MySQL image creates the database and application account using its initialization variables; the Spring application then applies `db/schema.sql` and `db/data.sql`. To set up a separate MySQL server, configure the same database and account, then run the schema script and seed script from `src/main/resources/db/` as that database user.

## Verify and operate

PowerShell:

```powershell
docker compose ps
docker compose logs --tail 100 mysql app adminer
Invoke-RestMethod http://localhost:8080/actuator/health
Invoke-RestMethod http://localhost:8080/api/metrics
Invoke-WebRequest http://localhost:8080/actuator/prometheus
```

CMD:

```cmd
docker compose ps
docker compose logs --tail 100 mysql app adminer
curl.exe --fail http://localhost:8080/actuator/health
curl.exe --fail http://localhost:8080/api/metrics
curl.exe --fail http://localhost:8080/actuator/prometheus
```

Open `http://localhost:8081` for Adminer. Connect using system `MySQL`, server `mysql`, username `pocuser`, and database `pocdb`; the password is in the local `.env`. The Adminer page is bound to localhost and is not intended for public exposure.

Restart or rebuild after source changes:

```powershell
docker compose restart
docker compose up --build --detach
```

Inspect service health:

```powershell
docker inspect --format '{{.Name}} {{.State.Health.Status}}' (docker compose ps -q app)
docker compose exec mysql mysqladmin ping -h 127.0.0.1 -u pocuser
```

Stop containers while retaining database data:

```powershell
docker compose down
```

Remove containers and the persistent database volume (irreversible data deletion):

```powershell
docker compose down --volumes
```

## Troubleshooting

- **Docker daemon unavailable:** start Docker Desktop, switch to Linux containers if prompted, wait for the engine to finish starting, then rerun `.\deploy.ps1`.
- **Port already in use:** stop the process using 8080, 3306, or 8081, or edit the host-side port in `docker-compose.yml`. These ports bind only to `127.0.0.1`.
- **MySQL connection failure:** run `docker compose logs --tail 100 mysql`; wait for its health check. Confirm `.env` still matches the credentials used when the persistent volume was initialized. Changing `.env` does not rotate accounts in an existing MySQL volume.
- **Application startup failure:** check `docker compose logs --tail 150 app mysql`; verify MySQL became healthy and schema validation succeeded.
- **Docker networking failure:** use service DNS name `mysql` from containers; `localhost` inside the app container is not the database. Both services must remain on the Compose `meridian` network.
- **Volume/data problems:** inspect `docker volume ls` and `docker volume inspect <project>_mysql-data`. Do not remove a volume unless its data can be discarded.
- **Windows script execution policy:** invoke `powershell -ExecutionPolicy Bypass -File .\deploy.ps1` only if local policy permits this; otherwise execute the commands in this document individually.

## Architecture and operational review

- The service is a modular monolith appropriate to the current scope; do not split it into microservices before independent scaling or team ownership requires it.
- Compose uses local-only credentials generated into `.env`, non-root application execution, a persistent database volume, health checks, bounded container logs, and loopback-only published ports. Do not reuse this local configuration in a shared or production environment.
- API authentication/authorization is not implemented. Keep the service private until an identity provider and role-based access control are configured.
- Configure TLS, managed secrets, database backups/restore tests, migrations with Flyway or Liquibase, alerting, retention, and production resource limits before production use.
- Use database pagination and indexed queries as history grows. Add tenant isolation and retention policies before onboarding real customer records.
- To scale the API horizontally, add idempotent retry handoff and a transactional outbox/worker first; then use Kafka or another durable broker if throughput and isolation justify it.
- Future work: runner callbacks, Kafka event streaming, AI anomaly detection, predictive failure analysis, tenant-specific retry policies, and self-healing workflows.
