# MechPro Experts Deployment Guide

This guide covers local Docker testing, CI/CD checks, and a free/trial deployment path.

## 1. Local Docker Test

Requirements:

- Docker Desktop
- Git

Run the full stack:

```powershell
cd E:\mechpro_chatptplus
docker compose up --build
```

Open:

```text
Frontend direct: http://localhost:3000
Backend direct:  http://localhost:8000
Nginx proxy:     http://localhost:8080
PostgreSQL:      localhost:5432
```

The backend container runs:

```text
npx prisma migrate deploy
node dist/server.js
```

So migrations are applied automatically when the backend starts.

## 2. Seed Demo Data In Docker

After containers are running:

```powershell
docker compose exec backend npm.cmd run seed
```

If `npm.cmd` is not available inside Linux container, use:

```powershell
docker compose exec backend npm run seed
```

## 3. Clear Docker Data

This deletes the local Docker database and uploads volume:

```powershell
docker compose down -v
docker compose up --build
```

## 4. GitHub CI

CI runs on push/PR:

- backend install
- Prisma generate
- backend TypeScript build
- frontend build
- Docker backend image build
- Docker frontend image build

Workflow file:

```text
.github/workflows/ci.yml
```

## 5. Free/Trial Deployment Recommendation

For demo:

```text
Render Free / Railway Trial
```

For production:

```text
Paid Render / Railway / VPS
Managed PostgreSQL
Cloudinary or AWS S3 for uploads
```

Important:

Local uploads are not safe for production hosting because free services can lose filesystem data after restart/redeploy.

## 6. Render Deployment

### Backend

Create a Web Service:

```text
Root Directory: backend
Environment: Docker
```

Environment variables:

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=your_render_postgres_internal_url
CORS_ORIGIN=https://your-frontend-service.onrender.com
PUBLIC_API_URL=https://your-backend-service.onrender.com
JWT_ACCESS_SECRET=replace_with_long_random_secret
JWT_REFRESH_SECRET=replace_with_long_random_secret
UPLOAD_DIR=uploads
STORAGE_PROVIDER=local
```

### Frontend

Create another Web Service:

```text
Root Directory: frontend
Environment: Docker
```

Build argument / environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
```

## 7. Railway Trial Deployment

Recommended setup:

```text
Service 1: PostgreSQL
Service 2: backend Dockerfile from /backend
Service 3: frontend Dockerfile from /frontend
```

Backend variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGIN=https://your-frontend-domain
PUBLIC_API_URL=https://your-backend-domain
JWT_ACCESS_SECRET=replace_with_long_random_secret
JWT_REFRESH_SECRET=replace_with_long_random_secret
UPLOAD_DIR=uploads
STORAGE_PROVIDER=local
```

Frontend variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain
```

## 8. Production Checklist

Before real production:

- Move uploads to Cloudinary or AWS S3.
- Use managed PostgreSQL backups.
- Replace demo JWT secrets.
- Enable HTTPS-only domains.
- Configure production CORS only for real domains.
- Run `npm audit` and fix critical issues.
- Add monitoring/logging.
- Add E2E tests for full workflow.
