# Ticket Triage

AI-powered support ticket triage. New tickets are automatically categorized, prioritized,
summarized, and routed to an assignee by an LLM call — everything else (auth, rate limiting,
the audit trail) is regular relational backend work.

## Stack

- **Frontend**: Next.js (App Router) + Tailwind + Framer Motion
- **Backend**: Node/Express + PostgreSQL
- **AI**: Google Gemini API (`gemini-2.5-flash-lite`, free tier)
- **Infra**: Docker Compose (backend + Postgres), GitHub Actions CI (lint, test, build)

## How triage actually works

1. A ticket is created via `POST /api/tickets`.
2. The API responds immediately (201) — the requester never waits on the LLM.
3. In the background, `triageService` calls Gemini with a schema that forces structured
   JSON output (`category`, `priority`, `summary`), then applies any matching routing
   rule to pick an assignee, and writes everything to `audit_log`.
4. Before every LLM call, `llmBudget` checks per-minute and per-day request counts against
   configurable limits. If the budget's used up, the ticket is marked `quota_exceeded`
   instead of erroring out or silently retrying — you can see this on the ticket detail page.

## Running locally

**1. Backend + database (Docker):**

```bash
cd backend
cp .env.example .env
# edit .env: add your GEMINI_API_KEY (free at ai.google.dev, no card required)
cd ..
docker compose up --build
```

The API is now on `http://localhost:4000`. The schema is applied automatically on first
Postgres startup via `docker-entrypoint-initdb.d`.

**2. Frontend:**

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Dashboard is on `http://localhost:3000`.

**3. Create a user to log in with** (there's no public signup UI on purpose):

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Agent","email":"agent@example.com","password":"changeme123"}'
```

## Running tests

```bash
cd backend
npm test
```

Covers the triage/categorization logic (including the budget-exhaustion path — verifies
the LLM is never even called once the daily cap is hit) and the ticket API routes.

## Deploying for free

- **Backend**: [Render](https://render.com) free web service tier (spins down after 15 min
  idle, ~30-60s cold start on the next request — fine for a demo)
- **Database**: [Neon](https://neon.tech) free Postgres (permanent free tier, scales to
  zero when idle, ~500ms wake) — don't use Render's bundled Postgres, it expires after 30 days
- **Frontend**: [Vercel](https://vercel.com), which is built for Next.js specifically

None of these require a credit card.

## Project structure

```
backend/
  src/
    config/      env loading + validation
    db/          Postgres pool
    middleware/  auth, rate limiting, security headers, validation, error handling
    services/    llmBudget (quota tracking), llmService (Gemini call), triageService (orchestration)
    controllers/ route handlers
    routes/
  db/schema.sql  users, tickets, categories, routing_rules, audit_log
  tests/
frontend/
  app/           login, dashboard, ticket detail (Next.js App Router)
  components/
  lib/           api client, auth token helpers
```
