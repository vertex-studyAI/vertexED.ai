import { defineConfig } from '@playwright/test';
import goldenConfig from './playwright.golden.config';

export default defineConfig({
  ...goldenConfig,
  testMatch: 'adaptive-integrity.spec.ts',
});
