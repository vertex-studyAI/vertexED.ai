import { defineConfig } from '@playwright/test';
import base from './playwright.reference.config';

export default defineConfig({
  ...base,
  testMatch: ['ap-library.spec.ts'],
  outputDir: 'test-results/ap-library',
  webServer: {
    command: 'npm run dev -- --config vite.ap-authoring.config.ts --host 127.0.0.1 --port 14213 --strictPort',
    url: 'http://127.0.0.1:14213',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
