import { defineConfig } from '@playwright/test';
import base from './playwright.golden.config';
export default defineConfig({
  ...base,
  testMatch: ['conversations.spec.ts'],
  outputDir: 'ci-evidence/conversations-20260927/browser',
  use: { ...base.use, baseURL: 'http://127.0.0.1:14189' },
  webServer: { ...base.webServer, command: base.webServer.command.replaceAll('14174', '14189'), url: 'http://127.0.0.1:14189' },
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({ name: browserName, use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' } })),
});
