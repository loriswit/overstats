# Overstats
A small web application that displays history and statistics of your ranked games in [Overwatch](https://playoverwatch.com).

## Client

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/loriswit/overstats/Client%20CI)](https://github.com/loriswit/overstats/actions?query=workflow%3A%22Client+CI%22)
[![GitHub deployments](https://img.shields.io/github/deployments/loriswit/overstats/Production?label=deploy)](https://overstats.now.sh)

### Features

- Sign in or create a new account.
- Quickly add and edit games.
- Display games history for each season.
- Display skill rating progression chart.

### Installation

Clone the repository and navigate to the *client* directory.
```sh
cd client
```

Define the API_URL environment variable (during development, define NUXT_HOST and NUXT_PORT as well).
```sh
export API_URL=http://host:port
```

Install dependencies and build the client into the *dist* directory.
```sh
npm install
```

You can then start a web server in the *dist* directory and start using the client.

### Development

You can run the following scripts using `npm run`:
- `dev`: start a development server
- `lint`: check for code quality and coding style
- `lint:fix`: fix coding styles issues

## Server

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/loriswit/overstats/Server%20CI)](https://github.com/loriswit/overstats/actions?query=workflow%3A%22Server+CI%22)
[![GitHub deployments](https://img.shields.io/github/deployments/loriswit/overstats/overstats-server?label=deploy)](https://overstats-server.herokuapp.com)
[![Codecov](https://img.shields.io/codecov/c/gh/loriswit/overstats)](https://codecov.io/gh/loriswit/overstats)

### API

#### Authentication
- `GET /login`: log into an account to get an access token

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

Clone the repository and navigate to the *server* directory.
```sh
cd server
```

Define the following environment variables appropriately.
```sh
export PORT=3000
export MONGODB_URI=mongodb://host/db
export JWT_SECRET=secret
export JWT_EXPIRE_AFTER=3600
```

Install dependencies and build the server.
```sh
npm install
```

Start the server.
```sh
npm start
```

### Development

You can run the following scripts using `npm run`:
- `dev`: start a development server
- `lint`: check for code quality and coding style
- `lint:fix`: fix coding styles issues
- `test`: run the tests
- `test:cov`: run tests and report coverage
