import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:14174';
const e2eAnonKey = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJpc3MiOiJ2ZXJ0ZXhlZC1lMmUiLCJyZWYiOiJ2ZXJ0ZXhlZC1lMmUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4ODI4ODAwMCwiZXhwIjoyMTAzODM2NDAwfQ',
  'vertexed-e2e-signature',
].join('.');

export default defineConfig({
  testDir: './e2e',
  testMatch: ['authenticated-student-golden.spec.ts', 'auth-return.spec.ts', 'vee-companion.spec.ts'],
  timeout: 90_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Certify the optimized artifact learners receive. Vite's development
    // server cold-transforms lazy route modules on first navigation, which can
    // make a correct route appear unavailable without reflecting production.
    command: `VITE_SUPABASE_URL=https://vertexed-e2e.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=${e2eAnonKey} VITE_SUPABASE_ANON_KEY=${e2eAnonKey} npm run build -- --outDir .vertexed-test-dist && npm run preview -- --outDir .vertexed-test-dist --host 127.0.0.1 --port 14174 --strictPort`,
    url: baseURL,
    // Never certify a stale build or another project's preview on this port.
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
