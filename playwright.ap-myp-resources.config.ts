import { defineConfig } from '@playwright/test';
import base from './playwright.reference.config';

// Local authoring verification only. The production publication policy is unchanged.
export default defineConfig({
  ...base,
  testMatch: ['ap-myp-resources.spec.ts'],
  outputDir: 'test-results/ap-myp-expansion-20261021/browser',
  use: { ...base.use, baseURL: 'http://127.0.0.1:14241' },
  webServer: {
    command: 'npm run dev -- --config vite.ap-authoring.config.ts --host 127.0.0.1 --port 14241 --strictPort',
    url: 'http://127.0.0.1:14241', reuseExistingServer: false, timeout: 60_000,
  },
});
