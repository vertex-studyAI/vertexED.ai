import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:14216';
export default defineConfig({
  testDir: './e2e', testMatch: ['beta-access.spec.ts'],
  timeout: 60_000, expect: { timeout: 15_000 }, workers: 1,
  outputDir: '.tmp/product-verification-20261016/browser',
  reporter: 'list',
  use: { baseURL, serviceWorkers: 'block', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({ name: browserName, use: { browserName: browserName as 'chromium' | 'firefox' | 'webkit' } })),
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'VITE_SUPABASE_URL=https://vertexed-e2e.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_vertexed_local_fixture npm run build -- --outDir .vertexed-access-test-dist && npm run preview -- --outDir .vertexed-access-test-dist --host 127.0.0.1 --port 14216 --strictPort',
    url: baseURL, reuseExistingServer: false, timeout: 300_000,
  },
});
