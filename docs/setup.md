# Setup

You can run this project in two ways: Docker or Locally

## Docker (Recommended)

> **Prerequisites:** Docker must be installed and running.

**1. Clone repository:**

```bash
git clone https://github.com/PantocaPipoca/Game-Reviewer.git
cd Game-Reviewer
```

**2. Create `.env` and `server/.env` files and start the containers:**

```bash
cp .env.example .env && cd server && cp .env.example .env && cd ..
```

> `.env.examples` have real test credentials.

**3. Start containers:**

```bash
docker compose up -d --build
```

- Server: http://localhost:3000
- Client: http://localhost:5173
- Alloy: http://localhost:12345
- Loki: http://localhost:3100
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

#### Remove IDE syntax errors

If you want to remove the errors in your IDE:

> **Prerequisites:** Node.js must be installed.

**1. Generate the Prisma client (from the `server` directory):**

```bash
cd server && npx prisma generate && cd ..
```

**2. Install dependencies (in server and client)**

```bash
cd server && npm install && cd ../client && npm install
```

---

## Run Locally

## Run Locally

> **Prerequisites:** Node.js and PostgreSQL must be installed and running locally.
> **Note:** The observability stack (Grafana, Prometheus, Loki, Alloy) requires Docker. To run it alongside the local server: `docker compose up -d grafana prometheus loki alloy`.

**1. Clone the repo:**

```bash
git clone https://github.com/PantocaPipoca/Game-Reviewer.git
cd Game-Reviewer
```

**2. Copy the env files:**

```bash
cp .env.example .env
cp server/.env.example server/.env
```

In `server/.env`, change the host in `DATABASE_URL` from `postgres` to `localhost`:

```bash
DATABASE_URL=postgresql://admin:admin123@localhost:5432/gr_db
```

> If your PostgreSQL runs on a different port, update `5432` accordingly.

**3. Create the database user and database:**

Connect to PostgreSQL as a superuser (typically `postgres`):

```bash
psql -U postgres
```

Then run:

```sql
CREATE USER admin WITH PASSWORD 'admin123';
CREATE DATABASE gr_db OWNER admin;
\q
```

> **Windows (CMD/PowerShell):** Use pgAdmin or run `psql` via Git Bash / WSL.

**4. Install dependencies and set up the database:**

```bash
cd server && npm install && npx prisma generate && npx prisma migrate deploy
```

**5. Start the server:**

```bash
npm run dev
```

**6. In a new terminal, start the client:**

```bash
cd client && npm install && npm run dev
```

- Server: http://localhost:3000
- Client: http://localhost:5173
