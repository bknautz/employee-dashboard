# Employee Progress Dashboard

Full-stack MERN dashboard for tracking employee reskilling/certification progress.

## Stack
- MongoDB / Mongoose
- Express / Node.js
- React / Vite
- JWT auth with role-based access control

## Setup
See /server and /client for individual setup instructions.

## Running with Docker
`docker-compose up --build` from the repo root starts the API server alongside a
local MongoDB container (no Atlas connection required) - see `docker-compose.yml`.
Requires a `server/.env` file (copy `server/.env.example` and fill in real values)
before starting. Verified working end-to-end, including the full API test
collection running against the Dockerized server.
