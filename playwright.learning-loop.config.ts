import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch: ['learning-os.spec.ts', 'product-rebuild.spec.ts'],
  projects: ['chromium', 'webkit', 'firefox'].map(browserName => ({
    name: browserName,
    use: { browserName: browserName as 'chromium' | 'webkit' | 'firefox', viewport: { width: 1440, height: 900 } },
  })),
});
