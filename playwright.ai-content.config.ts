import { defineConfig } from '@playwright/test';

const fixtureKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ2ZXJ0ZXhlZC1lMmUiLCJyZWYiOiJ2ZXJ0ZXhlZC1lMmUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4ODI4ODAwMCwiZXhwIjoyMTAzODM2NDAwfQ.vertexed-e2e-signature';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['ai-content-guides.spec.ts', 'ai-notebook-integrity.spec.ts'],
  timeout: 120_000,
  expect: { timeout: 12_000 },
  workers: 1,
  retries: 0,
  outputDir: 'test-results/ai-content',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:14179',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `VITE_SUPABASE_URL=https://vertexed-e2e.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=${fixtureKey} npm run build -- --outDir test-results/ai-content-build && npm run preview -- --outDir test-results/ai-content-build --host 127.0.0.1 --port 14179 --strictPort`,
    url: 'http://127.0.0.1:14179',
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
