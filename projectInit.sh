#!/bin/bash

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

    echo "NODE_ENV=development" > server/.env

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

    echo "(ATENÇÃO!!! uma vez usada numa máquina essa password não funcionará noutras máquinas)"
    printf "Insira uma das passwords da API de email fornecidas: "
    read -s EMAIL_PASSWORD
    echo "EMAIL_PASSWORD=$EMAIL_PASSWORD" >> server/.env
    echo

    echo >> server/.env
)

docker compose up --build -d

npx tsx server/src/Seed.ts

echo "página iniciada em http://localhost:5173"

echo "documentação da API em http://localhost:3000/api/docs"

echo "pare a execução com ./stop e/ou recomece com ./restart"

echo "a validaçao por email pode ser ativada ao alterar o valor \"NODE_ENV\" para \"production\" mas não funciona com a internet da uni ou se utilizar uma VPN"
