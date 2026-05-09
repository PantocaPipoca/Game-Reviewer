#!/bin/bash

cd server/

npm install

npx prisma generate client

cd ../client/

npm install
