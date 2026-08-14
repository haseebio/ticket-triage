-- Ticket triage schema
-- Run once against a fresh database: psql $DATABASE_URL -f db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS llm_usage (
  day_key       DATE PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routing_rules (
  id                  SERIAL PRIMARY KEY,
  category_id         INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  assignee_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  min_priority        VARCHAR(10) NOT NULL DEFAULT 'low' CHECK (min_priority IN ('low', 'medium', 'high', 'urgent')),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets (
  id              SERIAL PRIMARY KEY,
  source          VARCHAR(20) NOT NULL DEFAULT 'form' CHECK (source IN ('email', 'form', 'manual')),
  subject         VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  requester_email VARCHAR(255),
  status          VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority        VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  assignee_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ai_summary      TEXT,
  triage_status   VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (triage_status IN ('pending', 'processing', 'done', 'failed', 'quota_exceeded')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         SERIAL PRIMARY KEY,
  ticket_id  INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  actor      VARCHAR(50) NOT NULL,   -- 'system' | 'ai' | a user's email
  action     VARCHAR(100) NOT NULL, -- 'created' | 'triaged' | 'routed' | 'status_changed' | ...
  details    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_triage_status ON tickets(triage_status);
CREATE INDEX IF NOT EXISTS idx_audit_log_ticket ON audit_log(ticket_id);

-- A few starter categories so routing rules have somewhere to point.
INSERT INTO categories (name, description) VALUES
  ('billing', 'Payments, invoices, refunds'),
  ('technical', 'Bugs, errors, outages'),
  ('account', 'Login, access, profile changes'),
  ('general', 'Anything that does not fit elsewhere')
ON CONFLICT (name) DO NOTHING;