import { defineConfig } from '@playwright/test';
import base from './playwright.offline.config';

export default defineConfig({
  ...base,
  testMatch: ['ap-library.spec.ts'],
  outputDir: 'test-results/ap-library',
});
