import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global test setup
    setupFiles: ['./__tests__/setup.ts'],

    // Include patterns
    include: ['__tests__/**/*.test.ts'],

    // Exclude patterns
    exclude: ['node_modules', '.next'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', '.next', '__tests__'],
    },

    // Timeouts
    testTimeout: 10000,

    // Run tests sequentially for integration tests
    pool: 'forks',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
