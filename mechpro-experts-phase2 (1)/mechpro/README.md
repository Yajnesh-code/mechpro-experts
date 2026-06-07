# MechPro Experts — Phase 2: Lead Management System

A premium B2B2C Vehicle Service, Inspection and Claim Management Platform.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open in browser
http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── App.tsx                          # Root app with routing
├── index.tsx                        # Entry point
├── types/
│   └── index.ts                     # TypeScript interfaces
├── data/
│   └── mockData.ts                  # All mock data + helpers
├── hooks/
│   └── useApp.tsx                   # Global state context
├── utils/
│   └── index.ts                     # Formatters, helpers
├── styles/
│   └── globals.css                  # Full design system CSS
└── components/
    ├── layout/
    │   ├── AppLayout.tsx            # Main layout wrapper
    │   ├── Sidebar.tsx              # Role-aware sidebar
    │   └── Topbar.tsx               # Top navigation bar
    ├── common/
    │   ├── Badges.tsx               # Status/Priority badges
    │   ├── Modal.tsx                # Reusable modal
    │   ├── Timeline.tsx             # Status timeline
    │   └── RoleSwitcher.tsx         # Demo role selector
    ├── leads/
    │   ├── LeadCreateForm.tsx       # Multi-step lead creation
    │   ├── LeadListing.tsx          # Enterprise data table
    │   └── LeadDetail.tsx           # Full lead detail view
    ├── admin/
    │   ├── AdminDashboard.tsx       # Admin home dashboard
    │   └── AssignmentModal.tsx      # Partner assignment modal
    ├── sales/
    │   └── SalesDashboard.tsx       # Sales partner dashboard
    ├── service/
    │   ├── ServiceDashboard.tsx     # Service partner dashboard
    │   └── ServiceJobView.tsx       # Job list + status updates
    └── customer/
        └── CustomerTrackingPortal.tsx  # Public tracking portal
```

---

## 🗺️ Routing Structure

| Route | Component | Role |
|-------|-----------|------|
| `/` | RoleSwitcher | Public |
| `/admin` | AdminDashboard | Admin |
| `/admin/leads` | LeadListing | Admin |
| `/admin/leads/new` | LeadCreateForm | Admin |
| `/admin/leads/:id` | LeadDetail | Admin |
| `/sales` | SalesDashboard | Sales |
| `/sales/leads` | LeadListing | Sales |
| `/sales/leads/new` | LeadCreateForm | Sales |
| `/sales/leads/:id` | LeadDetail | Sales |
| `/service` | ServiceDashboard | Service |
| `/service/jobs` | ServiceJobView | Service |
| `/service/jobs/:id` | LeadDetail | Service |
| `/customer` | CustomerTrackingPortal | Customer |

---

## 🎯 Phase 2 Modules Built

### Module 1 — Lead Creation
- Multi-step form (4 steps)
- Customer, Vehicle, Service, Documents
- Auto-generates Lead ID: `ME0001BR01`
- File upload zone
- Summary preview before submit

### Module 2 — Lead Listing
- Enterprise data table with sorting on all columns
- Search by Lead ID, customer name, vehicle number
- Filter by Status and Priority
- Pagination (7 per page)
- Role-aware routing

### Module 3 — Lead Detail
- Tabbed layout: Overview, Timeline, Documents, Activity Log, Billing
- Customer & Vehicle info cards
- Assignment status
- Quote & Bill breakdown

### Module 4 — Admin Assignment
- Partner selection modal with ratings and specializations
- Notes field
- Live state update
- Success confirmation

### Module 5 — Status Timeline
- 12-stage timeline
- Visual progress indicators (completed/current/pending)
- Timestamps and performer names

### Module 6 — Service Partner View
- Assigned jobs table
- Update status modal
- Upload Quote modal
- Generate Bill modal (with GST calculation)

### Module 7 — Customer Tracking Portal
- Lead ID search
- Milestone grid (all 12 stages)
- Progress bar
- Timeline, Quote/Bill tabs
- Contact information

---

## 🎨 Design System

**Colors:**
- Primary Gradient: Purple `#8b5cf6` → Pink `#ec4899`
- Background: Soft Lavender `#f8f7ff`
- Navy Text: `#1e1b4b`
- Borders: `#ede9fe`

**Typography:**
- Display: Plus Jakarta Sans (headings, lead IDs)
- Body: DM Sans (content, labels)

**Components:**
- Glassmorphism cards with purple-tinted shadows
- Rounded corners (8–24px radius)
- Purple-gradient active states
- Smooth hover transitions

---

## 🔑 Demo Credentials (Mock)

| Role | Name | Path |
|------|------|------|
| Admin | Rajesh Kumar | `/admin` |
| Sales Partner | Rahul Sharma (BR01) | `/sales` |
| Service Partner | AutoSpark Workshop | `/service` |
| Customer | Arjun Kapoor | `/customer` |

---

## 🧩 TypeScript Interfaces

Key types in `src/types/index.ts`:
- `Lead` — Complete lead record
- `SalesPartner` — Sales partner with type code
- `ServicePartner` — Service partner with specializations
- `Customer`, `Vehicle`, `Document`
- `Quote`, `Bill`
- `TimelineEvent`, `ActivityLog`
- `LeadStatus` — 12 status stages
- `Priority` — Low / Medium / High / Urgent
- `UserRole` — admin / sales / service / customer

---

## 🔄 Unique Lead ID Format

```
ME + [4-digit sequence] + [partner type code] + [partner sequence]

Examples:
ME0001BR01 → Lead #1, Broker, Partner #01
ME0042CR02 → Lead #42, Corporate, Partner #02
ME0108FT03 → Lead #108, Fleet, Partner #03
```

Partner Type Codes:
- `BR` — Broker
- `CR` — Corporate
- `FT` — Fleet
- `AG` — Agency
- `IN` — Insurance
- `GT` — Guest

---

## 📋 Next Phases

- Phase 3: Backend API integration (Node.js + PostgreSQL)
- Phase 4: Notifications (SMS/Email/WhatsApp)
- Phase 5: Reports & Analytics
- Phase 6: Billing & Invoice generation (PDF)
- Phase 7: Mobile app (React Native)
