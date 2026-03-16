# RentFlow - Rental Management System

## Overview

RentFlow is a full-stack web application for managing rental properties digitally. It's designed as an admin-facing system that handles the complete lifecycle of property rental: from listing properties and registering tenants, to creating leases and tracking payments.

The app replaces manual paperwork with a clean, data-driven dashboard. Core modules include:
- **Authentication** – Secure admin login with session-based auth
- **Dashboard** – Overview stats (total properties, tenants, monthly income, pending payments) with a bar chart
- **Properties** – CRUD for rental units (name, type, location, rent, status)
- **Tenants** – CRUD for tenant records (name, email, phone, address)
- **Leases** – Link tenants to properties with date ranges; auto-marks properties as "Occupied"
- **Payments** – Record and track rent payments per lease (Pending / Paid status)

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend

- **Framework**: React (via Vite), TypeScript, not using React Server Components (`rsc: false`)
- **Routing**: `wouter` – lightweight client-side routing with routes for `/auth`, `/dashboard`, `/properties`, `/tenants`, `/leases`, `/payments`
- **State / Data Fetching**: TanStack Query (React Query v5) for all server state. Each domain has its own custom hook (`use-properties`, `use-tenants`, `use-leases`, `use-payments`, `use-stats`, `use-auth`)
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives, styled with Tailwind CSS
- **Forms**: React Hook Form + Zod resolvers, with schemas shared from `shared/schema.ts`
- **Charts**: Recharts (`BarChart`) used in Dashboard for monthly income visualization
- **Fonts**: Inter (body), Outfit (display/headings) from Google Fonts
- **Theme**: Blue and white premium palette, defined via CSS variables in `index.css`, dark mode class-based

### Backend

- **Runtime**: Node.js with Express (v5)
- **Language**: TypeScript, executed via `tsx` in dev; bundled with esbuild for production
- **Authentication**: Passport.js with `passport-local` strategy. Passwords hashed using Node's built-in `crypto.scrypt` with random salt. Sessions managed with `express-session` + `connect-pg-simple` (PostgreSQL session store) or `memorystore` as fallback
- **API Structure**: RESTful routes defined in `server/routes.ts`, all prefixed `/api/`. Route paths and Zod input/output schemas are co-located in `shared/routes.ts`, making them usable on both client and server
- **Storage Layer**: `server/storage.ts` defines an `IStorage` interface; the concrete implementation uses Drizzle ORM against PostgreSQL. This abstraction makes it easy to swap storage implementations

### Shared Layer (`shared/`)

- `shared/schema.ts` – Drizzle table definitions + Zod insert schemas (via `drizzle-zod`) for: `users`, `properties`, `tenants`, `leases`, `payments`
- `shared/routes.ts` – Typed API contract shared between frontend and backend (method, path, input schema, response schema). Frontend hooks call these typed paths directly

### Database

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `drizzle-kit` for migrations (`./migrations` folder)
- **Schema highlights**:
  - `users` – admin accounts with hashed passwords
  - `properties` – rental units with status (Available / Occupied)
  - `tenants` – renter contact records
  - `leases` – links property + tenant with date range; captures rent amount at signing
  - `payments` – per-lease payment records with status (Pending / Paid / Overdue)
- Run `npm run db:push` to apply schema changes

### Build & Dev

- **Dev**: `tsx server/index.ts` with Vite middleware for HMR
- **Production Build**: `tsx script/build.ts` runs Vite for the client (output: `dist/public`) then esbuild for the server (output: `dist/index.cjs`). Key server dependencies are bundled (allowlisted) to reduce cold start time
- **Path Aliases**: `@/` → `client/src/`, `@shared/` → `shared/`

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| PostgreSQL | Primary database (via `DATABASE_URL` env var) |
| `drizzle-orm` / `drizzle-kit` | ORM and migration tooling |
| `express-session` + `connect-pg-simple` | Server-side session storage in Postgres |
| `passport` / `passport-local` | Username/password authentication |
| `@tanstack/react-query` | Client-side data fetching and cache |
| `recharts` | Dashboard bar chart |
| `wouter` | Client-side routing |
| `react-hook-form` + `@hookform/resolvers` | Form state management |
| `zod` / `drizzle-zod` | Schema validation, shared between client and server |
| Radix UI primitives | Accessible headless UI components |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Pre-built component library on top of Radix |
| `date-fns` | Date formatting in tables and forms |
| `memorystore` | In-memory session store fallback (dev/testing) |
| Google Fonts (Inter, Outfit) | Typography |
| Replit Vite plugins (`runtime-error-modal`, `cartographer`, `dev-banner`) | Dev tooling in Replit environment only |

### Environment Variables Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for signing session cookies (falls back to hardcoded string in dev) |