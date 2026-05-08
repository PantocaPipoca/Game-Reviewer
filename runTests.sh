#!/bin/bash

docker compose down $1;

docker compose up -d --build ;

docker compose exec postgres sh -lc 'psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE test_db;" || true' ;

docker compose exec server sh -lc "npx dotenv-cli -e .env.test -o -- npx prisma migrate deploy" ;

docker compose exec server sh -lc "npm test" ;
