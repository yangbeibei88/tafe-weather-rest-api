# TAFE Weather REST API with MongoDB

This weather REST API is written in TypeScript, built with Deno (2.1.0), Express, MongoDB NodeJS driver (v6.10.0).

## MongoDB database

- Integrated with MongoDB with official library MongoDB NodeJS driver
- Persistant json validator to each collection (json validator is database level schema (similar to sql database's table schema), not application level schema like Mongoose)
- Compound indexes setup to increase query and aggregation performance
- MongoDB Atlas trigger setup

## Authentication & Authorisation

- JWT token for user authentication
- Express middleware for authorisation

## Validation & Sanitisation

- Using `express-validator` package (best validator package written in TypeScript)

## REST API Specifications

OpenAPI 3.1.0

## How to run this application

This application can run either in a docker container or on your local machine.

### Run in a container

#### Build & Run

All dependencies will be installed in the container.

`docker compose build --no-cache && docker compose up`

#### Stop the container

`CTRL + C`
OR
`docker compose stop`

#### Remove the container

`docker compose down`

---

### Run in a local machine

#### Prerequisites

- Install [Deno](https://docs.deno.com/runtime/)

#### Install dependencies

`deno install`

Although this project is built with Deno, most dependencies come from NPM. To avoid dependencies downloaded from the internet everytime, I've set `{"vendor": true}` in `deno.json` file.

So when you run `deno install`, npm packages will go to `node_modules` directory, jsr packages will go to `vendor` directory.

Reference: [Vendoring remote modules](https://docs.deno.com/runtime/fundamentals/modules/#vendoring-remote-modules).

#### Run the application

`deno task start`

- Server is running on port 3085
- Swagger UI is running on port 3086

Test the api from: [http://localhost:3086/api-docs](http://localhost:3086/api-docs)

## License

The project is licensed under [Apache license 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).
