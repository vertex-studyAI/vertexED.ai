import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vue from "@vitejs/plugin-vue"; // Added Vue plugin
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    vue(), // Added Vue support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Placeholder for Rollup options; keeps JS fallback if native isn't present
    rollupOptions: {},
  },
}));
