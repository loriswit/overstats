# Overstats
A small web application that displays history and statistics of your ranked games in [Overwatch](https://playoverwatch.com).

## Setup

Install the dependencies.
```shell
npm install
```

Start development servers parallelly for both the client and server:
```shell
npm run dev
```

## Client

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/loriswit/overstats/client.yml?branch=main)](https://github.com/loriswit/overstats/actions?query=workflow%3A%22Client+CI%22)
[![GitHub deployments](https://img.shields.io/github/deployments/loriswit/overstats/Production?label=deploy)](https://overstats.now.sh)

### Features

- Sign in or create a new account.
- Quickly add and edit games.
- Display games history for each season.
- Display skill rating progression chart.

### Installation

Define the `API_URL` environment variable (during development, define `NUXT_HOST` and `NUXT_PORT` as well).
```sh
export API_URL=http://host:port
```

Build the client into the *dist* directory.
```sh
npm run build -w @overstats/client
```

You can then start a web server in the *dist* directory and start using the client.

### Development

The following scripts are available in the client workspace:
- `dev`: start a development server
- `lint`: check for code quality and coding style
- `lint:fix`: fix coding styles issues

## Server

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/loriswit/overstats/server.yml?branch=main)](https://github.com/loriswit/overstats/actions?query=workflow%3A%22Server+CI%22)
[![GitHub deployments](https://img.shields.io/github/deployments/loriswit/overstats/overstats-server?label=deploy)](https://overstats-server.herokuapp.com)
[![Codecov](https://img.shields.io/codecov/c/gh/loriswit/overstats)](https://codecov.io/gh/loriswit/overstats)

### API

#### Authentication
- `GET /login`: log into an account to get an access token
- `GET /token`: get a new token by providing an existing valid token

#### Seasons
- `GET /seasons`: list all seasons names

#### Users
- `POST /users`: create a new user
- `GET /users/{name}`: read an existing user
- `DELETE /users/{name}`: delete an existing user

#### Games
- `GET /users/{name}/games`: list all games from the user
- `POST /users/{name}/game`: create a new game
- `GET /users/{name}/games/{id}`: read an existing game
- `PATCH /users/{name}/games/{id}`: update an existing game
- `DELETE /users/{name}/games/{id}`: delete an existing game

#### Placements
- `GET /users/{name}/placements`: list all placements from the user
- `POST /users/{name}/placements`: create a new placement
- `GET /users/{name}/placements/{id}`: read an existing placement
- `PATCH /users/{name}/placements/{id}`: update an existing placement
- `DELETE /users/{name}/placements/{id}`: delete an existing placement

### Installation

Define the following environment variables appropriately.
```sh
export PORT=3000
export MONGODB_URI=mongodb://host/db
export JWT_SECRET=secret
export JWT_EXPIRE_AFTER=3600
```

Build the server.
```sh
npm run build -w @overstats/server
```

Start the server.
```sh
npm start -w @overstats/server
```

### Development

The following scripts are available in the server workspace:
- `dev`: start a development server
- `lint`: check for code quality and coding style
- `lint:fix`: fix coding styles issues
- `test`: run the tests
- `test:cov`: run tests and report coverage
