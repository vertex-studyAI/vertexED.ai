import { defineConfig } from '@playwright/test';
import base from './playwright.reference.config';

export default defineConfig({
  ...base,
  testMatch: ['foundation-library.spec.ts', 'foundation-diagrams.spec.ts'],
  outputDir: 'test-results/content-expansion-20261021/browser',
  use: { ...base.use, baseURL: 'http://127.0.0.1:14231' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 14231 --strictPort',
    url: 'http://127.0.0.1:14231',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
