/**
 * Test Setup
 *
 * This file runs before all tests. Use it to:
 * - Load environment variables
 * - Set up global mocks
 * - Configure test utilities
 */

import { config } from 'dotenv';

// Load environment variables from .env.local for integration tests
config({ path: '.env.local' });

// Validate required env vars for integration tests
export function requireEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for integration tests: ${missing.join(', ')}\n` +
        'Make sure you have a .env.local file with valid Supabase credentials.'
    );
  }
}
