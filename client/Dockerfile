FROM node:22-alpine

WORKDIR /app

# install dependecies
COPY package*.json ./
RUN npm install

# copy project files
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]