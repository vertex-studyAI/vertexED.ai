import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vue from "@vitejs/plugin-vue"; 
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    vue(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {}
  }
}));
