# MechPro Experts Architecture Analysis

## Approved Frontend ZIP

Source: `mechpro-experts-phase2 (1)/mechpro`

Framework: Create React App + React Router + TypeScript.

### Route Map

- `/` -> `RoleSwitcher`
- `/admin` -> `AdminDashboard`
- `/admin/leads` -> `LeadListing role="admin"`
- `/admin/leads/new` -> `LeadCreateForm`
- `/admin/leads/:id` -> `LeadDetail role="admin"`
- `/sales` -> `SalesDashboard`
- `/sales/leads` -> `LeadListing role="sales"`
- `/sales/leads/new` -> `LeadCreateForm`
- `/sales/leads/:id` -> `LeadDetail role="sales"`
- `/service` -> `ServiceDashboard`
- `/service/jobs` -> `ServiceJobView`
- `/service/jobs/:id` -> `LeadDetail role="service"`
- `/customer` and `/customer/track` -> `CustomerTrackingPortal`

### Component Map

- `components/layout`: app shell, sidebar, topbar.
- `components/admin`: dashboard and assignment modal.
- `components/sales`: sales dashboard.
- `components/service`: service dashboard and job workflow view.
- `components/leads`: lead list, lead detail, create form.
- `components/customer`: customer tracking portal.
- `components/common`: badges, modal, timeline, role switcher.

### State And Data Flow

- `hooks/useApp.tsx` owns global state.
- Current state source is `data/mockData.ts`.
- Mutations are in-memory only: `addLead`, `updateLead`.
- Lead assignment, status updates, quote upload, and bill generation are UI-level mutations today.

### Mock Dependencies To Replace

- `mockCurrentUser`, `mockSalesUser`, `mockServiceUser`, `mockCustomerUser`.
- `mockLeads`.
- `mockSalesPartners`.
- `mockServicePartners`.
- Hard-coded service partner filter `assignedServicePartner?.id === 'sv1'`.
- Customer demo preload `leads.find(l => l.id === 'l1')`.

## Current Visible Frontend

Source: `frontend/`

Framework: Next.js App Router.

Protected UI modules must remain visually unchanged:

- Landing page: `src/components/marketing/LandingPage.tsx`.
- Auth pages: `src/app/login`, `src/app/register/*`, `src/app/forgot-password`, `src/app/reset-password`.
- Dashboard shell/components under `src/components/portal`.

Current auth already calls `src/lib/api.ts`, but falls back to localStorage mocks. Backend integration should remove fallback after backend is stable.

## Backend Target Architecture

Source: `backend/`

- `src/controllers`: HTTP request/response adapters.
- `src/routes`: route declarations only.
- `src/services`: business rules and workflow transitions.
- `src/repositories`: Prisma database access.
- `src/middleware`: auth, role guards, upload, errors.
- `src/validators`: Zod payload validation.
- `src/utils`: JWT, password hashing, serialization, app errors.
- `prisma/schema.prisma`: production database model.
- `prisma/seed.ts`: seed users, lead, timeline.

## Primary Business Flow

Sales Partner creates lead -> Admin assigns service partner -> Service Partner updates workflow/uploads docs/quotes/invoices -> Customer tracks timeline.

## Lead Code Rule

`ME` + four digit running sequence + vendor code.

Example: `ME0001BR01`.
