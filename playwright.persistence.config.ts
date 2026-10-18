import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', testMatch: ['persistence-recovery.spec.ts'],
  timeout: 90_000, expect: { timeout: 15_000 }, workers: 1,
  outputDir: '.tmp/product-verification-20261016/persistence-browser',
  reporter: [['list'], ['json', { outputFile: '.tmp/product-verification-20261016/persistence-browser/results.json' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:14216',
    serviceWorkers: 'block', trace: 'retain-on-failure', screenshot: 'only-on-failure',
  },
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({
    name: browserName, use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
});
