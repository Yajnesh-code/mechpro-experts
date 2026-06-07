# MechPro Experts Architecture

## System Overview

MechPro is designed as a B2B2C platform with clear boundaries:

1. Frontend (Next.js): marketing website + secure role-based portal UI.
2. Backend (FastAPI): business workflows, lead orchestration, claim lifecycle, partner mapping, invoicing, and analytics APIs.
3. Database (PostgreSQL): normalized transactional data + reporting views.
4. Object Storage (S3/Cloudinary): RC images, car photos, claim docs, inspection media, invoice attachments.
5. Auth Layer (JWT / NextAuth): role-based access for Admin, Business Client, Partner, and Claims team.

## High-Level Flow

1. Business client visits website and submits lead/demo form.
2. Lead enters CRM queue with business profile + service intent.
3. Authenticated users create customer profile and vehicle records.
4. Vehicle media/documents are uploaded and linked to lead.
5. MechPro assigns verified partner based on geography/SLA/type.
6. Partner uploads quotation and service status updates.
7. Claims workflow proceeds with approvals, inspections, documents.
8. Invoice and payment events are tracked until closure.
9. Feedback is captured and used in partner performance scoring.

## Role Modules

1. Super Admin: platform governance, partner approvals, SLA monitoring.
2. Business Client: create/manage leads, track jobs, approvals, payments.
3. Service Partner: quotation updates, work progress, invoice upload.
4. Claims Team: claim handling, survey follow-up, settlement tracking.

## Deployment Topology

1. Frontend: Vercel.
2. Backend API: Render or AWS ECS/App Runner.
3. PostgreSQL: managed database (RDS/Neon/Supabase).
4. Storage: AWS S3 or Cloudinary.
5. Monitoring: Sentry + logs + uptime checks.
