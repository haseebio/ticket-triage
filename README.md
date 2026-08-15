# Ticket Triage (TicketHandler)

![CI](https://github.com/haseebio/ticket-triage/actions/workflows/ci.yml/badge.svg?branch=main)
[![Live demo](https://img.shields.io/badge/demo-live-FF6B4A)](https://tickethandler-haseeb.vercel.app)

AI-powered support ticket triage — a portfolio project. New tickets are automatically
categorized, prioritized, summarized, and routed to an assignee by an LLM call; everything
else (auth, rate limiting, the audit trail, timestamps, retries) is regular relational
backend work, built and tested like a real production system.

**Goal of this project:** demonstrate SQL, Docker, CI/CD, and automated testing alongside a
genuine AI-integration feature, as a portfolio piece for job applications.

**Live:**
- Frontend: https://tickethandler-haseeb.vercel.app
- Backend API: https://ticket-triage-ps4n.onrender.com
- Repo: https://github.com/haseebio/ticket-triage

## Stack

- **Frontend**: Next.js (App Router) + Tailwind CSS + Framer Motion (2D UI motion only —
  no 3D anywhere) + Recharts (analytics)
- **Backend**: Node/Express + PostgreSQL
- **AI**: Google Gemini API (`gemini-2.5-flash-lite`, free tier), with a 15s request
  timeout and a single automatic retry on transient failures
- **Infra**: Docker Compose (backend + Postgres locally), GitHub Actions CI (lint, test, build)
- **Hosting**: Vercel (frontend), Render (backend), Neon (Postgres) — all free tier

## User roles

Two roles exist on the `users` table: `admin` and `agent`. Both currently have the same
access in the UI (no admin-only screens yet) — the field exists for future use.

## How triage actually works

1. A ticket is created via `POST /api/tickets`, optionally with the requester's email.
2. The API responds immediately (201) — the requester never waits on the LLM.
3. In the background, `triageService` calls Gemini with a schema that forces structured
   JSON output (`category`, `priority`, `summary`), applies any matching routing rule
   to pick an assignee, and writes everything to `audit_log`.
4. Before every LLM call, `llmBudget` checks per-minute (in-memory) and per-day
   (persisted in Postgres) request counts against configurable limits. If the budget's
   used up, the ticket is marked `quota_exceeded`.
5. If the Gemini call itself fails transiently (timeout, network error, malformed
   response), it's retried once automatically before the ticket is marked `failed`.
6. Either way, an agent can trigger a manual retry from the ticket detail page once the
   underlying issue (quota reset, transient failure) has passed.
7. `created_at` and `resolved_at` are both stamped and shown on the ticket detail page.

## Pages

- `login` — sign-in, demo credentials with copy buttons
- `about` — what the project is/does, plus an FAQ section (FAQPage schema)
- `developer` — who built it, with contact links (Person schema)
- `dashboard` — ticket list, stats, filters, pagination, new-ticket form
- `dashboard/tickets/[id]` — ticket detail: routing trace, timestamps, status controls,
  retry-triage button for failed/quota-exceeded tickets
- `dashboard/routing-rules` — manage category → priority → assignee routing rules
  (previously required direct SQL)
- `dashboard/analytics` — tickets by category/status, average time-to-resolution, and a
  14-day volume chart

About, Developer, and Analytics are all reachable from the dashboard's persistent sidebar
nav, not just as standalone public pages.

## SEO / discoverability

- Full metadata in `layout.js`: Open Graph, Twitter card, canonical URL, keywords
- Person, SoftwareApplication, FAQPage, and BreadcrumbList structured data (JSON-LD)
- Favicon and social preview images via Next.js file-convention, sized ~1200×630
- Auto-generated `sitemap.xml` and `robots.txt` (dashboard excluded from indexing)
- Verified with Google Search Console and Bing Webmaster Tools

## Current status

Fully working end to end: login, AI triage (with retry and timeout handling), routing
rule management, status updates, pagination, analytics, and a persisted AI usage budget
that survives Render free-tier cold starts. CI runs lint/test/build on every push, backed
by both unit tests (mocked DB) and integration tests that hit the real API against a
second Postgres database.

**Known open items:**
- No self-serve signup — users are created manually, by design (see below)
- Analytics recalculates on every page load rather than caching (fine at current volume)

## Running locally

**1. Backend + database (Docker):**

\`\`\`bash
cd backend
cp .env.example .env
# edit .env: add your GEMINI_API_KEY (free at ai.google.dev, no card required)
cd ..
docker compose up --build
\`\`\`

The API is now on `http://localhost:4000`. The schema is applied automatically on first
Postgres startup via `docker-entrypoint-initdb.d`.

**2. Frontend:**

\`\`\`bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
\`\`\`

Dashboard is on `http://localhost:3000`.

**3. Create a user to log in with** (there's no public signup UI on purpose):

\`\`\`bash
curl -X POST http://localhost:4000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Agent","email":"agent@example.com","password":"changeme123"}'
\`\`\`

## Running tests

\`\`\`bash
cd backend
docker compose up -d postgres   # integration tests need a real database
npm test
\`\`\`

Runs both the mocked unit tests (triage/budget logic, route validation) and the
integration tests, which spin up a second Postgres database (`ticket_triage_test`) on
the same container, apply the real schema, and hit the real Express app end to end —
verifying ticket creation, status updates, and retry-triage against actual rows rather
than mocks.

## Deploying for free

- **Backend**: [Render](https://render.com) free web service tier (spins down after 15 min
  idle, ~30-60s cold start on next request)
- **Database**: [Neon](https://neon.tech) free Postgres (permanent free tier, scales to
  zero when idle) — don't use Render's bundled Postgres, it expires after 30 days
- **Frontend**: [Vercel](https://vercel.com), built for Next.js specifically

None of these require a credit card.