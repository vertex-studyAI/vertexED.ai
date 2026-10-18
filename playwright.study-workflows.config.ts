import { defineConfig } from '@playwright/test';
import base from './playwright.golden.config';

// Synthetic accounts exercise persistence and browser behaviour, not live
// authentication/provider acceptance. Each run builds the current source.
export default defineConfig({
  ...base,
  testMatch: ['coursework.spec.ts', 'focus-session.spec.ts', 'saved-work-search.spec.ts'],
  outputDir: 'test-results/study-workflows',
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({
    name: browserName,
    use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' },
  })),
});
