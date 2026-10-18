import { defineConfig } from '@playwright/test';
import base from './playwright.golden.config';

// Reuse the isolated production build and synthetic account configuration.
// These journeys verify local content and UI, not live authentication.
export default defineConfig({
  ...base,
  testMatch: ['myp-*.spec.ts', 'product-rebuild.spec.ts'],
  outputDir: 'test-results/release-content',
  workers: 1,
});
