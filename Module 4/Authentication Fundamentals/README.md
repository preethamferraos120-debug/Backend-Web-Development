# Authentication Fundamentals

## Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm start
```

The SQLite datasource keeps local setup self-contained. Do not commit `.env` or `prisma/dev.db`.

## Endpoints

### POST /auth/register

Request JSON:

```json
{ "name": "Sam", "email": "sam@example.com", "password": "correct horse battery staple" }
```

Creates an account with an asynchronous bcryptjs password hash. The response contains only `id`, `name`, and `email`.

### POST /auth/login

Request JSON:

```json
{ "email": "sam@example.com", "password": "correct horse battery staple" }
```

Returns only `id`, `name`, and `email` on success. Unknown email and incorrect password return the same generic `401 INVALID_CREDENTIALS` response.

Malformed or missing fields return `400`; duplicate normalized email returns `409`; unexpected errors return a controlled `500`.

## Example requests

```bash
curl -i -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sam","email":"sam@example.com","password":"correct horse battery staple"}'

curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sam@example.com","password":"correct horse battery staple"}'
```
