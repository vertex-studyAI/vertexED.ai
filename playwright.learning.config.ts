import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: ['learning-os.spec.ts', 'product-rebuild.spec.ts', 'adaptive-practice.spec.ts', 'auth-return.spec.ts'], workers: 2, projects: [{ name: 'chromium', use: { browserName: 'chromium' } }] });
