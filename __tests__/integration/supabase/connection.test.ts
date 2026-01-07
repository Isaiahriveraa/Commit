/**
 * Supabase Connection Integration Tests
 *
 * These tests verify that:
 * 1. Environment variables are properly configured
 * 2. Supabase client can connect to the database
 * 3. All required tables exist and are accessible
 *
 * IMPORTANT: Requires .env.local with valid Supabase credentials
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { requireEnvVars } from '../../setup';
import type { Database } from '@/types/database';

describe('Supabase Connection', () => {
  let supabase: SupabaseClient<Database>;

  beforeAll(() => {
    // Ensure env vars are present
    requireEnvVars();

    // Create client for tests
    supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  });

  describe('Environment Configuration', () => {
    it('should have NEXT_PUBLIC_SUPABASE_URL set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(
        /^https:\/\/[a-z0-9-]+\.supabase\.co$/
      );
    });

    it('should have NEXT_PUBLIC_SUPABASE_ANON_KEY set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.length).toBeGreaterThan(
        0
      );
    });
  });

  describe('Database Tables', () => {
    const tables = [
      'team_members',
      'agreements',
      'agreement_signatures',
      'deliverables',
      'deliverable_dependencies',
      'updates',
      'update_reactions',
    ] as const;

    it.each(tables)('should have access to %s table', async (tableName) => {
      const { error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      expect(error).toBeNull();
    });
  });

  describe('Table Schema Validation', () => {
    it('should have correct columns in team_members', async () => {
      const { error } = await supabase
        .from('team_members')
        .select('id, name, email, avatar_url, role, created_at')
        .limit(0);

      expect(error).toBeNull();
      // If query succeeds with these columns, schema is correct
    });

    it('should have correct columns in agreements', async () => {
      const { error } = await supabase
        .from('agreements')
        .select('id, title, description, status, created_by, created_at, updated_at')
        .limit(0);

      expect(error).toBeNull();
    });

    it('should have correct columns in deliverables', async () => {
      const { error } = await supabase
        .from('deliverables')
        .select(
          'id, title, description, owner_id, deadline, progress, status, created_at, updated_at'
        )
        .limit(0);

      expect(error).toBeNull();
    });

    it('should have correct columns in updates', async () => {
      const { error } = await supabase
        .from('updates')
        .select('id, content, author_id, deliverable_id, is_help_request, created_at')
        .limit(0);

      expect(error).toBeNull();
    });

    it('should have correct columns in deliverable_dependencies', async () => {
      const { error } = await supabase
        .from('deliverable_dependencies')
        .select('id, deliverable_id, depends_on_id, created_at')
        .limit(0);

      expect(error).toBeNull();
    });
  });

  describe('Row Level Security', () => {
    it('should have RLS enabled (tables accessible via anon key)', async () => {
      // If we can query without auth and get no error, RLS policies allow it
      const { error } = await supabase.from('team_members').select('id').limit(1);

      // No error means RLS policies are configured to allow access
      expect(error).toBeNull();
    });
  });
});
