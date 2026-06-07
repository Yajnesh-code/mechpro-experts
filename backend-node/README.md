# MechPro Experts Node Backend Starter

Enterprise-ready starter structure using Express + Prisma + PostgreSQL + JWT.

## Folder Structure

```txt
backend-node/
  prisma/
    schema.prisma
  src/
    config/
    controllers/
    middleware/
    prisma/
    routes/
    services/
    app.js
    server.js
```

## Quick Start

1. Install deps

```bash
cd backend-node
npm install
```

2. Configure env

```bash
cp .env.example .env
```

3. Generate Prisma client and run migration

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start server

```bash
npm run dev
```

## Starter Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (Bearer token)
- `GET /api/v1/users` (ADMIN role only)
