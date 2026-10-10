import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', testMatch: 'landing-motion.spec.ts', workers: 1,
  timeout: 60_000, expect: { timeout: 12_000 },
  outputDir: './ci-evidence/ui-motion-20260924/browser',
  reporter: [['list'], ['json', { outputFile: './ci-evidence/ui-motion-20260924/browser-results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4188', viewport: { width: 1440, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium', launchOptions: { args: ['--enable-unsafe-swiftshader'] } } }],
});
