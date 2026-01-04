/**
 * Supabase Client Configuration
 *
 * This module initializes and exports the Supabase client for database operations.
 * Uses environment variables for secure credential management.
 *
 * SECURITY NOTES:
 * - NEXT_PUBLIC_ variables are exposed to the browser (intentional for anon key)
 * - The anon key is safe client-side because RLS policies restrict access
 * - Never use service_role key on the client side
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Validate required environment variables at initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please copy .env.local.example to .env.local and add your Supabase URL.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please copy .env.local.example to .env.local and add your Supabase anon key.'
  );
}

// Validate URL format to prevent injection attacks
const urlPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;
if (!urlPattern.test(supabaseUrl)) {
  throw new Error(
    'Invalid NEXT_PUBLIC_SUPABASE_URL format. ' +
      'Expected format: https://your-project-id.supabase.co'
  );
}

/**
 * Supabase client instance
 *
 * Use this client for all database operations. The client is typed with
 * the Database interface for full TypeScript autocomplete and type safety.
 *
 * @example
 * // Fetch all team members
 * const { data, error } = await supabase.from('team_members').select('*');
 *
 * @example
 * // Insert a new agreement
 * const { data, error } = await supabase
 *   .from('agreements')
 *   .insert({ title: 'New Agreement', status: 'pending' });
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage for client-side auth
    persistSession: true,
    // Auto-refresh tokens before expiry
    autoRefreshToken: true,
  },
});
