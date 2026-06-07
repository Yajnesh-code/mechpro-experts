# MechPro Experts Backend

TypeScript Express API for MechPro Experts.

## Setup

1. Create PostgreSQL database:

```powershell
createdb mechpro_experts
```

2. Configure env:

```powershell
Copy-Item .env.example .env
```

3. Install and prepare database:

```powershell
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:migrate -- --name init
npm.cmd run seed
```

4. Start API:

```powershell
npm.cmd run dev
```

API base URL: `http://localhost:8000`.

## Seed Login

All seed users use password: `MechPro@123`

- Admin: `admin@mechproexperts.in`
- Sales Partner: `sales@mechproexperts.in`
- Service Partner: `service@mechproexperts.in`
- Customer: `customer@mechproexperts.in`

## Key Endpoints

- `POST /register`
- `POST /login`
- `POST /refresh-session`
- `POST /logout`
- `GET /me`
- `GET /leads`
- `POST /leads`
- `PATCH /leads/:id/assign`
- `PATCH /leads/:id/status`
- `POST /leads/:id/quotes`
- `POST /leads/:id/invoices`
- `POST /leads/:id/documents`
- `GET /partners/service-partners`

## Workflow

Sales Partner creates lead -> Admin assigns service partner -> Service Partner updates statuses, quote, invoice, documents -> Customer tracks timeline.
