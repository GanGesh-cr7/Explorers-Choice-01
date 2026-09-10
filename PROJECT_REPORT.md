# Explorers Choice — Project Report

## 1. Overview

Explorers Choice is a full-stack travel-booking platform for a boutique travel company. It combines a content/marketing website (destinations, packages, itineraries, customer stories) with a production booking system, customer accounts, and an internal admin workspace.

The repository is a two-part monorepo:

- **Frontend** — Next.js App Router application at the repository root.
- **Backend** — FastAPI + PostgreSQL service under `backend/`.

A static content fallback (`src/data/`) powers all public marketing pages at build time, so the site is fully static/SSG and remains deployable even when the API is offline. The live booking, account, and admin flows talk to the FastAPI backend over a JSON REST API.

## 2. Tech Stack

### Frontend
| Area | Choice |
| --- | --- |
| Framework | Next.js 16.3.4 (Turbopack), App Router |
| UI runtime | React 19.2.8, React DOM 19.2.8 |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), custom design tokens (forest, terracotta, ivory, cream, charcoal) |
| Fonts | Manrope (body), DM Serif Display (display) |
| Lint | ESLint 9 + `eslint-config-next` (core-web-vitals) |

### Backend
| Area | Choice |
| --- | --- |
| Framework | FastAPI (app version 2.0.0) |
| ORM | SQLAlchemy 2.0.36 |
| Database | PostgreSQL (psycopg2-binary) |
| Migrations | Alembic 1.14+ |
| Auth | JWT (python-jose) in an HttpOnly cookie + bcrypt password hashing |
| Validation/Config | Pydantic v2, pydantic-settings, python-multipart, python-slugify |
| Server | uvicorn |

## 3. Repository Structure

```
├── src/                        # Next.js frontend
│   ├── app/                    # App Router pages
│   ├── components/             # UI, layout, booking, account, home, cards
│   ├── data/                   # Static content fallback (SSG source)
│   ├── hooks/                  # useMyBookings etc.
│   └── lib/                    # API clients, types, meta helpers
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, 409 handler, router mounting
│   │   ├── config.py           # Settings, fail-closed secret guard
│   │   ├── database.py         # SQLAlchemy engine/session
│   │   ├── models.py           # ORM models
│   │   ├── schemas.py          # Pydantic request/response models
│   │   ├── crud.py             # Business/data access layer
│   │   ├── security.py         # Auth deps, cookie session, rate limiting
│   │   ├── routes/             # FastAPI routers
│   │   └── migrations/         # Alembic versions (0001–0005)
│   ├── seed.py / app/seed.py   # Idempotent demo-content seeder
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
└── PROJECT_REPORT.md           # This document
```

## 4. Frontend Architecture

### 4.1 Rendering model
- **Static / SSG**: marketing pages (`/`, `/about`, `/destinations`, `/packages`, `/stories`, `/faq`, `/contact`) are server components reading from `src/data`.
- **Dynamic routes use `generateStaticParams`**: `/destinations/[slug]`, `/packages/[slug]`, `/stories/[slug]` pre-render one page per data entry.
- **Client components (`"use client"`)**: booking flow, confirmation lookups, auth forms, account pages, and the entire admin workspace. These fetch the API via `src/lib`.
- SEO: `sitemap.ts` (static + API-fed detail URLs with 3600s revalidation) and `robots.ts` (disallow `/account/`, auth pages, `book/confirmation`).

### 4.2 Route map

**Public/content**
| Route | Notes |
| --- | --- |
| `/` | Home: Hero, destinations, packages, how-it-works, why-us, planner team, stories, FAQ CTA |
| `/about`, `/contact`, `/faq` | Static content pages |
| `/destinations`, `/destinations/[slug]` | Destination listing + detail with related packages |
| `/packages`, `/packages/[slug]` | Package listing + detail with day-by-day itinerary and booking sidebar |
| `/stories`, `/stories/[slug]` | Customer stories (4 seed stories) |
| `/book` | Client booking flow (`?package=` / `?destination=` preselect) |
| `/book/confirmation` | Public booking confirmation lookup by `?ref=…`, no login required |

**Auth**
| Route | Notes |
| --- | --- |
| `/login`, `/register` | Credential forms; support `?redirect=` |
| `/forgot-password`, `/reset-password` | Token-based password reset |

**Customer account** (client-guarded; redirects to `/login?redirect=…`)
| Route | Notes |
| --- | --- |
| `/account` | Trip overview |
| `/account/profile` | Profile editing |
| `/account/bookings`, `/account/bookings/[id]` | Booking list + detail |
| `/account/payments` | Payment history |
| `/account/documents` | Secure documents list/download |

**Admin workspace** (role-guarded: TRAVEL_AGENT / MANAGER / ACCOUNTANT / ADMIN)
| Route | Notes |
| --- | --- |
| `/admin` | Dashboard: metrics, today's actions, recent payments |
| `/admin/bookings`, `/admin/bookings/[id]` | Booking management, notes, payment recording |
| `/admin/enquiries`, `/admin/enquiries/[id]` | Enquiry CRM |
| `/admin/customers`, `/admin/customers/[id]` | Customer directory |
| `/admin/offers`, `/admin/stories` | Offers & published stories CRUD |
| `/admin/staff`, `/admin/settings` | Staff management, key/value settings (ADMIN only) |
| `/admin/audit-log` | Audit trail |

### 4.3 Key libraries & data flow
- `src/lib/auth.ts` — client auth API (`login`, `register`, `fetchCurrentUser`, resets). Base URL `NEXT_PUBLIC_EXPLORERS_API_URL` with fallback `http://localhost:8000/api`. Used by `providers.tsx` (`AuthProvider`, auth context).
- `src/lib/catalog.ts` — server-side catalog fetch using `EXPLORERS_API_URL`.
- `src/lib/bookings.ts`, `admin.ts`, `account.ts` — REST clients per domain with typed responses.
- `src/lib/bookingMeta.ts` — status → label/color mapping helpers.
- `src/components/booking/BookingFlow.tsx` — multi-step client flow (package selection → details → price summary → submit), submits to POST `/api/bookings`.
- `src/data/` — static fallbacks: **8 destinations**, **8 packages**, **4 stories** used as SSG source.

## 5. Backend Architecture

FastAPI app in `backend/app/main.py` (title "Explorers Choice API", v2.0.0). Layered flow: **routes → crud → models/schemas → database**. A global `IntegrityError` handler converts FK/unique violations to `409`.

### Router mount table
| Prefix | Router | Purpose |
| --- | --- | --- |
| `/api/destinations` | `destinations.py` | Public destination catalog |
| `/api/packages` | `packages.py` | Public package catalog |
| `/api/bookings` | `bookings.py` | Booking creation + public reference lookup |
| `/api/auth` | `auth.py` | Register, login, logout, me, password flows |
| `/api/account` | `account.py` | Authenticated customer bookings/payments/documents |
| `/api/admin` | destinations/packages/bookings/admin routers | Admin CRUD + dashboard |
| `/api/health` | — | Liveness check (200 `{"status":"ok"}`) |

### API surface (selected endpoints)

**Public**
- `GET /api/destinations` , `GET /api/destinations/{slug}`
- `GET /api/packages` , `GET /api/packages/{slug}`
- `POST /api/bookings` (request-only / instant modes), `GET /api/bookings/reference/{reference}`

**Auth**
- `POST /api/auth/register|login|logout`, `GET|PATCH /api/auth/me`, `POST /api/auth/forgot-password|reset-password|change-password`

**Account (authenticated)**
- `GET /api/account` , `GET /api/account/{booking_id}` , `…/payments`, `…/documents`, `GET /api/account/documents/{id}/download`

**Admin**
- `GET /api/admin/dashboard`; customers & enquiries CRUD; booking notes & payments; documents upload/download; offers; customer-stories; staff; settings; audit-log; destination/package admin CRUD (incl. itinerary & FAQ for packages).

## 6. Data Model (migrations 0001–0005)

| Table | Purpose |
| --- | --- |
| `destinations` | Catalog entity: name/slug/country/region, hero + gallery (JSONB), highlights, things-to-do, travel info, featured/active flags |
| `packages` | FK → destinations; slug, duration, price (Numeric 12,2), included/excluded (JSONB), booking_mode (`REQUEST_ONLY` / instant), policies |
| `itinerary_days` | Per-package day-by-day itinerary (activities JSONB, meals, accommodation) |
| `package_faqs` | Per-package Q&A with sort order |
| `users` | Customer + staff accounts; `role` (CUSTOMER/TRAVEL_AGENT/MANAGER/ACCOUNTANT/ADMIN), `is_staff`, `token_version` (session invalidation) |
| `password_reset_tokens` | Single-use hashed tokens with expiry |
| `bookings` | Reference, traveller counts, contact snapshot, subtotal/taxes/total/currency, `status`, `payment_status`, denormalized package/destination snapshot |
| `booking_travellers` | Traveller type/quantity breakdown per booking |
| `payments` | Amount/currency/status/provider + provider reference |
| `booking_documents` | Secure document registry (is_secure, file path) for download |
| `booking_notes` | Internal note stream per booking (audit staff) |
| `enquiries` | CRM: lead info, interest, travel window, budget, status (NEW → …), assignment, next action |
| `customer_stories` | Published testimonials/posts |
| `offers` | Promo campaigns (PERCENT/amount, validity window, optional package link) |
| `audit_logs` | Action journal with entity/entity_id/details |
| `settings` | Key/value JSON store (unique key) |

The seeder (`backend/seed.py`) creates the same destinations/packages/stories as the frontend fallback in an idempotent fashion (skips existing slugs).

## 7. Authentication & Security

- **Session**: HttpOnly cookie `ec_session` holding an HS256 JWT signed with `SECRET_KEY`. Cookie sent via CORS `allow_credentials=True`.
- **Roles**: CUSTOMER / TRAVEL_AGENT / MANAGER / ACCOUNTANT / ADMIN. Route deps `require_admin()` / `require_roles(...)`. Admin client layouts guard the UI; the API enforces server-side.
- **Session invalidation**: `users.token_version` is embedded in the JWT and bumped on password change — old tokens are rejected (`0005`).
- **Rate limiting**: in-memory sliding-window limiter on auth/booking routes (per-IP + optional login-keyed).
- **Passwords**: bcrypt hashes; reset tokens stored hashed and single-use.
- **Config fail-closed**: `config.py` refuses to start if `SECRET_KEY` / `ADMIN_API_KEY` are missing unless `EXPLORERS_ALLOW_INSECURE=true` (local dev only). CORS origins scoped from `CORS_ORIGINS`.

### Environment
| Variable | Used by |
| --- | --- |
| `NEXT_PUBLIC_EXPLORERS_API_URL` | Frontend API base (client + build) |
| `EXPLORERS_API_URL` | Server-side catalog fetch |
| `NEXT_PUBLIC_SITE_URL` | Sitemap/robots base |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Contact/support CTA |
| `DATABASE_URL`, `SECRET_KEY`, `ADMIN_API_KEY`, `CORS_ORIGINS`, `COOKIE_SECURE`, `EXPLORERS_ALLOW_INSECURE` | Backend |

## 8. Verification Status

Checked at analysis time (all passing):
- `npx tsc --noEmit` — clean, exit 0.
- `npm run lint` (ESLint 9) — clean.
- `npm run build` (Next 16, Turbopack) — success; ~52 routes generated (static detail pages, dynamic client pages, account/admin splits).
- `npm run dev` — serves pages normally; booking/auth/account pages that consume the API degrade gracefully to static content when the API is offline (60s fetch timeout on catalog).

## 9. Known Issues & Observations

1. **Unresolved editor diagnostic at `src/lib/auth.ts:56`** — the reported `fetch` error could not be reproduced; typecheck, lint, build, and dev server all pass. Likely stale editor/ESLint state or a truncated diagnostic message. Worth re-opening the file / restarting TS server.
2. **No root `.env` committed** — expected (secrets never committed); frontend falls back to `http://localhost:8000/api` if env is absent.
3. **Static/API data parity must be maintained manually** — the SSG site data lives in `src/data/` while live content lives in PostgreSQL; edited content only appears on static pages after a rebuild that repopulates the fallback (or after switching pages to fetch at runtime).
4. **`boto`/document storage** — `booking_documents.file_path` implies file storage; no storage backend is configured in-repo (uploads are admin API only).
5. **in-memory rate limiting** — resets on process restart; acceptable for single-process dev/API but should move to shared storage (Redis) for multi-worker production.