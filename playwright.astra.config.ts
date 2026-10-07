import { defineConfig } from '@playwright/test';
import base from './playwright.golden.config';

// Build with the same explicit, non-secret fixture auth configuration as golden
// journeys. A clean checkout must not depend on somebody's private .env.local.
// These fixtures test the UI, not live auth or provider quality.
export default defineConfig({
  ...base,
  testMatch: ['learning-os.spec.ts', 'study-desk.spec.ts', 'theme-controls.spec.ts'],
  outputDir: 'ci-evidence/astra-20260927/browser-matrix',
  workers: 1,
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({
    name: browserName,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
});
