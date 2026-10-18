import { defineConfig } from '@playwright/test';
import base from './playwright.offline.config';

// Run after building with the same synthetic auth variables as golden journeys.
// Reuse that fresh bundle so offline installation and account journeys exercise
// the same artifact without another build or a development server.
export default defineConfig({
  ...base,
  testMatch: ['offline-study.spec.ts', 'learning-os.spec.ts'],
  grep: /calendar|offline/,
  outputDir: 'test-results/offline-calendar',
});
