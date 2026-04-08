-- ─────────────────────────────────────────
--  Anesu PJ — Supabase Schema Migration
--  Run this in Supabase SQL Editor or via
--  the migration script: npm run migrate
-- ─────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS (staff/agents) ────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin','agent','viewer')),
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CUSTOMERS ───────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT,
  company       TEXT,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active','vip','at_risk','churned','inactive')),
  total_spent   NUMERIC(12,2) DEFAULT 0,
  notes         TEXT,
  tags          TEXT[],
  owner_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEADS ───────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  company       TEXT,
  source        TEXT CHECK (source IN ('website','referral','linkedin','cold_outreach','event','other')),
  stage         TEXT DEFAULT 'new' CHECK (stage IN ('new','discovery','qualified','proposal','closed_won','closed_lost')),
  score         INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  estimated_value NUMERIC(12,2),
  notes         TEXT,
  owner_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_id   UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── APPOINTMENTS ─────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
  lead_id       UUID REFERENCES leads(id) ON DELETE SET NULL,
  owner_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('consultation','follow_up','demo','strategy','proposal','other')),
  status        TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','completed','cancelled','no_show','rescheduled')),
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INTEGER NOT NULL DEFAULT 60,
  location      TEXT,
  meeting_url   TEXT,
  notes         TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACTIVITIES (audit log) ───────────────
CREATE TABLE IF NOT EXISTS activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('appointment','lead','customer')),
  entity_id     UUID NOT NULL,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ANALYTICS EVENTS ────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name    TEXT NOT NULL,
  event_data    JSONB,
  session_id    TEXT,
  user_agent    TEXT,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at  ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id   ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status        ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_leads_stage                ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_score                ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id             ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_status           ON customers(status);
CREATE INDEX IF NOT EXISTS idx_activities_entity          ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name       ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at       ON analytics_events(created_at);

-- ─── ROW LEVEL SECURITY ──────────────────
ALTER TABLE customers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities   ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (server-side)
CREATE POLICY "service_role_all" ON customers    FOR ALL USING (true);
CREATE POLICY "service_role_all" ON leads        FOR ALL USING (true);
CREATE POLICY "service_role_all" ON appointments FOR ALL USING (true);
CREATE POLICY "service_role_all" ON activities   FOR ALL USING (true);

-- ─── UPDATED_AT TRIGGER ──────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON leads        FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users        FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
