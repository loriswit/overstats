# build step

FROM node:16-slim as build
WORKDIR /app

COPY package*.json ./
COPY server/package.json ./server/
RUN npm ci -w @overstats/server

COPY server ./server/
RUN npm run build -w @overstats/server
RUN npm prune --omit=dev --omit=peer --omit=optional -w @overstats/server
RUN rm -rf package*.json server/package.json server/src sevrer/test
RUN npx -y delete-empty


# start server

FROM node:16-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
CMD [ "node", "server/dist/server.js" ]
