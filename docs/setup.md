# Setup

You can run this project in two ways.

## Docker (Recommended)

> Prerequisites: Docker must be installed and running.

1. Clone and copy `.env` files (all values in the `.env.example` files and `.env.test` are safe placeholder values for local use):

```bash
git clone https://github.com/PantocaPipoca/Game-Reviewer.git
cd Game-Reviewer
cp .env.example .env && cd server && cp .env.example .env
```

2. Generate the Prisma client (from the `server` directory):

```bash
npx prisma generate
```

> This step also clears any TypeScript red squiggles related to Prisma types in your IDE.

3. Go back to the root and start the containers:

```bash
cd ..
docker compose up -d --build
```

- Server: http://localhost:3000
- Client: http://localhost:5173
- Alloy: http://localhost:12345
- Loki: http://localhost:3100
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

---

## Run Locally

> Prerequisites: PostgreSQL must be installed and running locally.

1. Clone the repo:

```bash
git clone https://github.com/PantocaPipoca/Game-Reviewer.git
cd Game-Reviewer
```

2. Copy the env files and update the database host:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

In `server/.env`, change the host in `DATABASE_URL` from `postgres` to `localhost`:

```
DATABASE_URL=postgresql://admin:admin123@localhost:5432/gr_db
```

3. Create the database:

```bash
PGPASSWORD=admin123 psql -h localhost -U admin -d postgres -c "CREATE DATABASE gr_db;"
```

4. Install dependencies and set up the database (from the `server` directory):

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
```

> Running `npm install` also clears TypeScript/ESLint syntax errors that may show up in your IDE before dependencies are installed.

5. Start the server:

```bash
npm run dev
```

6. In a new terminal, install and run the client:

```bash
cd client
npm install
npm run dev
```

- Server: http://localhost:3000
- Client: http://localhost:5173

> Note: the observability stack (Grafana, Prometheus, Loki, Alloy) requires Docker. If you want those running alongside the local server, you can start just the observability containers with `docker compose up -d grafana prometheus loki alloy`.
