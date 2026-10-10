import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
  ...base,
  testMatch: ['study-desk.spec.ts'],
  outputDir: 'ci-evidence/study-desk-20260925/browser-verified',
  webServer: { command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4186 --strictPort', url: 'http://127.0.0.1:4186' },
  use: { ...base.use, baseURL: 'http://127.0.0.1:4186' },
  workers: 1,
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({ name: browserName, use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' } })),
});
