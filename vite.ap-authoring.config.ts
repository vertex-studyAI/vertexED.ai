import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Test-only authoring preview for held AP drafts. Production and the ordinary
// development server continue to apply the exact-hash publication boundary.
export default defineConfig({
  server: { host: '127.0.0.1', port: 14213, cors: false },
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
