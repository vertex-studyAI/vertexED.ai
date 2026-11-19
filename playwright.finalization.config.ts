import { defineConfig } from '@playwright/test';
import base from './playwright.golden.config';

// External providers use explicit fixtures. This suite does not certify live auth or AI.
export default defineConfig({
  ...base,
  testMatch: ['finalization-landing.spec.ts', 'authenticated-student-golden.spec.ts',
    'auth-return.spec.ts', 'google-login-return.spec.ts', 'mobile-navigation.spec.ts',
    'coursework.spec.ts', 'focus-session.spec.ts', 'saved-work-search.spec.ts',
    'foundation-library.spec.ts', 'content-ecosystem.spec.ts', 'ai-notebook-integrity.spec.ts'],
  outputDir: 'test-results/finalization-20261021',
});
