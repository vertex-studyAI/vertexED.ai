import { defineConfig } from '@playwright/test';
import base from './playwright.offline.config';

export default defineConfig({
  ...base,
  testMatch: ['learning-os.spec.ts', 'study-tools-hub.spec.ts', 'formula-desk.spec.ts', 'offline-study.spec.ts'],
  grep: /planner navigation|study tools hub|formula desk renders|deep links|drafts stay|keyboard tabs|library search restores|typing URL|offline/,
  outputDir: 'test-results/navigation-ux',
});
