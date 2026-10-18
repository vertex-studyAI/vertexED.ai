import { defineConfig } from '@playwright/test';

const productionBundle = process.env.VERTEXED_REFERENCE_BUILT === '1';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['formula-desk.spec.ts', 'learning-library.spec.ts', 'study-tools-hub.spec.ts'],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  retries: 0,
  reporter: 'list',
  outputDir: productionBundle ? 'test-results/reference-desk-production' : 'test-results/reference-desk',
  use: {
    baseURL: 'http://127.0.0.1:14213',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run ${productionBundle ? 'preview' : 'dev'} -- --host 127.0.0.1 --port 14213 --strictPort`,
    url: 'http://127.0.0.1:14213',
    reuseExistingServer: !productionBundle,
    timeout: 60_000,
  },
});
