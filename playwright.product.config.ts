import { defineConfig } from '@playwright/test';
import access from './playwright.access.config';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:14218';
export default defineConfig({
  ...access,
  testMatch: [
    'beta-access.spec.ts', 'learning-publication-recovery.spec.ts',
    'content-review-boundary.spec.ts', 'persistence-recovery.spec.ts',
    'coursework.spec.ts', 'focus-session.spec.ts', 'saved-work-search.spec.ts',
    'offline-publication.spec.ts',
    'ai-usage.spec.ts',
    'math-rendering.spec.ts',
  ],
  timeout: 90_000,
  outputDir: '.tmp/product-verification-20261016/browser-built',
  reporter: [
    ['list'],
    ['json', { outputFile: '.tmp/product-verification-20261016/browser-built-results.json' }],
  ],
  use: { ...access.use, baseURL },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'VITE_SUPABASE_URL=https://vertexed-e2e.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_vertexed_local_fixture npm run build -- --outDir .vertexed-product-final-dist && npm run preview -- --outDir .vertexed-product-final-dist --host 127.0.0.1 --port 14218 --strictPort',
    url: baseURL, reuseExistingServer: false, timeout: 300_000,
  },
});
