# Tests

This project has **unit** and **integration** tests.
Integration tests use a **real PostgreSQL database** (`test_db`) and require migrations to be applied before running - explained bellow.

## Run Tests in Docker (Recommended)

Run script `scripts/runTests.sh` to run this commands in bash automatically.

> Prerequisites: Docker and Docker Compose must be installed and running.

1. Start the containers:

```bash
docker compose up -d --build
```

2. Create the test database inside Postgres (first time only):

```bash
docker compose exec postgres sh -lc 'psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE test_db;" || true'
```

3. Apply migrations to `test_db`:

```bash
docker compose exec server sh -lc "npx dotenv-cli -e .env.test -o -- npx prisma migrate deploy"
```

4. Run all backend tests:

```bash
docker compose exec server sh -lc "npm test"
```

---

## Run Tests Locally

> Prerequisites: PostgreSQL must be installed and running, along with the client and server (`/docs/setup.md`).

1. Create the test database:

```bash
PGPASSWORD=admin123 psql -h localhost -U admin -d postgres -c "CREATE DATABASE test_db;" || true
```

2. Make sure `server/.env.test` has `localhost` as the host:

```env
DATABASE_URL=postgresql://admin:admin123@localhost:5432/test_db
```

3. Apply migrations:

```bash
cd server
npx dotenv-cli -e .env.test -o -- npx prisma migrate deploy
```

4. Run tests:

```bash
npm test
```
