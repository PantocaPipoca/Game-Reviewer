FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of project files
COPY . .

EXPOSE 3000

# Updated CMD to run migrations then start server
CMD npx prisma migrate deploy && npm run dev