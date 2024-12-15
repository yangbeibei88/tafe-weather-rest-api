# TAFE Weather REST API with MongoDB

## Run in a container

### Build & Run

All dependencies will be installed in the container.

`docker compose build --no-cache && docker compose up`

### Stop the container

`CTRL + C`
OR
`docker compose stop`

### Remove the container

`docker compose down`

---

## Run in local machine

### Prerequisites

- Install [Deno](https://docs.deno.com/runtime/)

### Install dependencies

`deno install`

### Run the application

`deno task start`

- Server is running on port 3085
- Swagger UI is running on port 3086

Test the api from: [http://localhost:3086/api-docs](http://localhost:3086/api-docs)