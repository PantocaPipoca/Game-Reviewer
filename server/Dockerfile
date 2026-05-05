FROM node:22-alpine

RUN apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma

COPY . .

EXPOSE 3000

# Generate, run migrations and start server
CMD npx prisma generate && npx prisma migrate deploy && npm run dev