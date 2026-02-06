FROM node:20-alpine

WORKDIR /app

# install dependecies
COPY package*.json ./
RUN npm install

# copy project files
COPY . .

# generate prisma client
#RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
