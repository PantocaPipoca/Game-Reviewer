#!/bin/bash

cd ..

docker compose down $1;

docker compose up --build
