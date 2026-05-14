#!/bin/bash

cd ..

set -e

(
    source .env.example

    echo "POSTGRES_USER=$POSTGRES_USER" > .env

    echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" >> .env

    echo "POSTGRES_DB=$POSTGRES_DB" >> .env

    echo "DATABASE_URL=$DATABASE_URL" >> .env
)

(
    source server/.env.example

    echo "NODE_ENV=production" > server/.env

    echo >> server/.env

    echo "DATABASE_URL=$DATABASE_URL" >> server/.env

    echo >> server/.env

    echo "IGDB_CLIENT_ID=$IGDB_CLIENT_ID" >> server/.env

    echo "IGDB_CLIENT_SECRET=$IGDB_CLIENT_SECRET" >> server/.env

    echo >> server/.env

    echo "JWT_SECRET=$JWT_SECRET" >> server/.env

    echo "JWT_EXPIRES_IN=$JWT_EXPIRES_IN" >> server/.env

    echo "CSRF_SECRET=$CSRF_SECRET" >> server/.env

    echo >> server/.env

    echo "CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME" >> server/.env

    echo "CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY" >> server/.env

    echo "CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET" >> server/.env

    echo >> server/.env

    echo "EMAIL=$EMAIL" >> server/.env

    echo "(WARNING!!! once an email is sent using a password, that password will only ever work on the machine that sent it)"
    printf "Insert one of the given email API passwords: "
    read -s EMAIL_PASSWORD
    echo "EMAIL_PASSWORD=$EMAIL_PASSWORD" >> server/.env
    echo

    echo >> server/.env
)

docker compose up --build -d

sleep 5 # for some reason docker detatches from the terminal before fully starting

npx tsx server/src/Seed.ts

echo "client server started on http://localhost:5173"

echo "stop execution with \"./stop\" and/or restart with \"./restart\""
