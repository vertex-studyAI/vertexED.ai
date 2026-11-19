import base from './playwright.ai-content.config';
import { defineConfig } from '@playwright/test';
export default defineConfig({ ...base, testMatch: ['content-ecosystem.spec.ts'], outputDir: 'test-results/content-ecosystem' });
