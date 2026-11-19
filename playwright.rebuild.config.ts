import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: 'product-rebuild.spec.ts',
  workers: 2,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', serviceWorkers: 'block' } },
    { name: 'webkit', use: { browserName: 'webkit', serviceWorkers: 'block' } },
    { name: 'firefox', use: { browserName: 'firefox', serviceWorkers: 'block' } },
  ],
});
