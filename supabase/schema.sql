-- =============================================================================
-- Commit Database Schema
-- =============================================================================
-- Run this SQL in the Supabase SQL Editor to create all tables.
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
--
-- SECURITY: Row Level Security (RLS) is enabled on all tables.
-- Adjust policies based on your authentication requirements.
-- =============================================================================

-- =============================================================================
-- Team Members Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies: Allow read access to all authenticated users
-- For now, allow all operations (adjust based on auth requirements)
CREATE POLICY "Allow all read access to team_members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to team_members"
  ON team_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to team_members"
  ON team_members FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- Agreements Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'archived')),
  created_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all read access to agreements"
  ON agreements FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to agreements"
  ON agreements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to agreements"
  ON agreements FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all delete access to agreements"
  ON agreements FOR DELETE
  USING (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agreements_updated_at
  BEFORE UPDATE ON agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Agreement Signatures Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS agreement_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agreement_id, member_id)
);

-- Enable RLS
ALTER TABLE agreement_signatures ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all read access to agreement_signatures"
  ON agreement_signatures FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to agreement_signatures"
  ON agreement_signatures FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all delete access to agreement_signatures"
  ON agreement_signatures FOR DELETE
  USING (true);

-- =============================================================================
-- Deliverables Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  deadline DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-progress', 'at-risk', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all read access to deliverables"
  ON deliverables FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to deliverables"
  ON deliverables FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to deliverables"
  ON deliverables FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all delete access to deliverables"
  ON deliverables FOR DELETE
  USING (true);

CREATE TRIGGER update_deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Updates (Status Posts) Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE SET NULL,
  is_help_request BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all read access to updates"
  ON updates FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to updates"
  ON updates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all delete access to updates"
  ON updates FOR DELETE
  USING (true);

-- =============================================================================
-- Update Reactions Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS update_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES updates(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(update_id, member_id, reaction_type)
);

-- Enable RLS
ALTER TABLE update_reactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all read access to update_reactions"
  ON update_reactions FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to update_reactions"
  ON update_reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all delete access to update_reactions"
  ON update_reactions FOR DELETE
  USING (true);

-- =============================================================================
-- Seed Data (Optional - Comment out in production)
-- =============================================================================
-- Uncomment to add test data:

-- INSERT INTO team_members (name, email, role) VALUES
--   ('Sarah Chen', 'sarah@example.com', 'lead'),
--   ('Mike Ross', 'mike@example.com', 'member'),
--   ('Emma Wilson', 'emma@example.com', 'member'),
--   ('Alex Kim', 'alex@example.com', 'member');

-- =============================================================================
-- Indexes for Performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_agreements_status ON agreements(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_owner ON deliverables(owner_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_deadline ON deliverables(deadline);
CREATE INDEX IF NOT EXISTS idx_updates_author ON updates(author_id);
CREATE INDEX IF NOT EXISTS idx_updates_deliverable ON updates(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_updates_created ON updates(created_at DESC);
