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
-- Deliverable Dependencies Table (Many-to-Many)
-- =============================================================================
-- Tracks which deliverables depend on which other deliverables.
-- deliverable_id: The deliverable that has dependencies
-- depends_on_id: The prerequisite deliverable it depends on
CREATE TABLE IF NOT EXISTS deliverable_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  depends_on_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deliverable_id, depends_on_id),
  -- Prevent self-referential dependencies
  CHECK (deliverable_id != depends_on_id)
);

-- Enable RLS
ALTER TABLE deliverable_dependencies ENABLE ROW LEVEL SECURITY;

-- Policies: Ensure users can only access dependencies for deliverables they can see
CREATE POLICY "Allow read access to deliverable_dependencies when user can access both deliverables"
  ON deliverable_dependencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliverables d1 WHERE d1.id = deliverable_id
    )
    AND EXISTS (
      SELECT 1 FROM deliverables d2 WHERE d2.id = depends_on_id
    )
  );

CREATE POLICY "Allow insert into deliverable_dependencies when user can access both deliverables"
  ON deliverable_dependencies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deliverables d1 WHERE d1.id = deliverable_id
    )
    AND EXISTS (
      SELECT 1 FROM deliverables d2 WHERE d2.id = depends_on_id
    )
  );

CREATE POLICY "Allow delete from deliverable_dependencies when user can access both deliverables"
  ON deliverable_dependencies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM deliverables d1 WHERE d1.id = deliverable_id
    )
    AND EXISTS (
      SELECT 1 FROM deliverables d2 WHERE d2.id = depends_on_id
    )
  );

-- =============================================================================
-- Circular Dependency Prevention
-- =============================================================================
-- Prevents circular dependency chains (e.g., A→B→C→A)
CREATE OR REPLACE FUNCTION prevent_deliverable_dependency_cycles()
RETURNS TRIGGER AS $$
DECLARE
  cycle_found BOOLEAN;
BEGIN
  -- Skip check if either ID is NULL (shouldn't occur due to NOT NULL)
  IF NEW.deliverable_id IS NULL OR NEW.depends_on_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Recursive search: starting from depends_on_id, walk forward to see if we reach deliverable_id
  WITH RECURSIVE dependency_chain AS (
    SELECT d.deliverable_id, d.depends_on_id
    FROM deliverable_dependencies d
    WHERE d.deliverable_id = NEW.depends_on_id

    UNION

    SELECT next_dep.deliverable_id, next_dep.depends_on_id
    FROM deliverable_dependencies next_dep
    JOIN dependency_chain dc ON next_dep.deliverable_id = dc.depends_on_id
  )
  SELECT EXISTS (
    SELECT 1 FROM dependency_chain WHERE depends_on_id = NEW.deliverable_id
  ) INTO cycle_found;

  IF cycle_found THEN
    RAISE EXCEPTION 'Inserting dependency (% -> %) would create a circular dependency chain.',
      NEW.deliverable_id, NEW.depends_on_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to prevent cycles on insert/update
CREATE TRIGGER trg_prevent_deliverable_dependency_cycles
  BEFORE INSERT OR UPDATE ON deliverable_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION prevent_deliverable_dependency_cycles();

-- Index for efficient dependency lookups
CREATE INDEX IF NOT EXISTS idx_deliverable_deps_deliverable ON deliverable_dependencies(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_deps_depends_on ON deliverable_dependencies(depends_on_id);

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
-- Atomic Deliverable Creation with Dependencies
-- =============================================================================
-- Creates a deliverable and its dependencies in a single transaction.
-- If any part fails (e.g., circular dependency), everything is rolled back.
CREATE OR REPLACE FUNCTION create_deliverable_with_dependencies(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL,
  p_deadline DATE DEFAULT NULL,
  p_status TEXT DEFAULT 'upcoming',
  p_progress INTEGER DEFAULT 0,
  p_dependency_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_deliverable deliverables%ROWTYPE;
  v_dep_id UUID;
BEGIN
  -- Insert the deliverable
  INSERT INTO deliverables (title, description, owner_id, deadline, status, progress)
  VALUES (p_title, p_description, p_owner_id, p_deadline, p_status, p_progress)
  RETURNING * INTO v_deliverable;

  -- Insert dependencies if provided
  IF p_dependency_ids IS NOT NULL THEN
    FOREACH v_dep_id IN ARRAY p_dependency_ids LOOP
      INSERT INTO deliverable_dependencies (deliverable_id, depends_on_id)
      VALUES (v_deliverable.id, v_dep_id);
    END LOOP;
  END IF;

  -- Return the created deliverable as JSON
  RETURN row_to_json(v_deliverable);
END;
$$ LANGUAGE plpgsql;

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
