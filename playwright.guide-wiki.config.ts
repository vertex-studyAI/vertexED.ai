import { defineConfig } from '@playwright/test';

// This suite supplies all auth, account, AI and guide responses in the browser.
// The development server must never require a real Supabase project or AI key.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'guide-wiki-chat.spec.ts',
  outputDir: 'test-results/guide-wiki-chat',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/guide-wiki-chat/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:14217',
    browserName: 'webkit',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 14217 --strictPort',
    url: 'http://127.0.0.1:14217',
    reuseExistingServer: false,
    timeout: 90_000,
    env: {
      VITE_SUPABASE_URL: 'https://guide-wiki-fixture.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'fixture-publishable-key',
      VITE_SUPABASE_ANON_KEY: 'fixture-anon-key',
    },
  },
});
