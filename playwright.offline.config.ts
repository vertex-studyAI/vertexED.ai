import { defineConfig } from '@playwright/test';
import base from './playwright.reference.config';

export default defineConfig({
  ...base,
  testMatch: ['offline-study.spec.ts'],
  outputDir: 'test-results/offline-study',
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 14213 --strictPort',
    url: 'http://127.0.0.1:14213',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
