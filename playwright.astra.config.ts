import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// These local integration fixtures test the UI, not live auth or provider quality.
export default defineConfig({
  ...base,
  testMatch: ['learning-os.spec.ts', 'study-desk.spec.ts'],
  outputDir: 'ci-evidence/astra-20260927/browser-matrix',
  workers: 1,
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({
    name: browserName,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
});
