FROM node:16
WORKDIR /app

COPY package*.json ./
COPY server/package.json ./server/
RUN npm ci

COPY . .
RUN npm run build -w @overstats/server

EXPOSE 3000
CMD [ "npm", "start", "-w", "@overstats/server" ]
