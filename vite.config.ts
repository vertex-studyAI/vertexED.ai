import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Polyfill process.env for the API handlers
  Object.assign(process.env, env);

  return {
    server: {
      host: "::",
      port: 8080,
      // Vite handles OPTIONS before configureServer hooks. Let the canonical
      // API handler own preflight; other dev assets remain same-origin only.
      cors: false,
    },
    plugins: [
      react(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use('/api', (req, res, next) => {
            void import('./api/_lib/nodeAdapter.js').then(({ nodeApiMiddleware }) => {
              return nodeApiMiddleware(req, res);
            }).catch(() => {
              if (res.headersSent) return next();
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'API could not be loaded locally.' }));
            });
          });
        }
      }
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      // PDF/KaTeX bundles are large by nature; warn only for truly extreme outliers
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              const appChunk =
                id.includes('/src/lib/studyEcosystem') ||
                id.includes('/src/lib/learnerProfile') ||
                id.includes('/src/lib/adaptiveLearning') ||
                id.includes('/src/lib/weaknessTracker') ||
                id.includes('/src/lib/progressAnalytics') ||
                id.includes('/src/lib/cramMode') ||
                id.includes('/src/lib/curriculum') ||
                id.includes('/src/lib/studyStats') ||
                id.includes('/src/lib/srDeck');
              if (appChunk) return 'ecosystem';
              return undefined;
            }
            if (id.includes('@supabase/supabase-js')) return 'supabase';
            if (id.includes('react-type-animation')) return 'typewriter';
            if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-') || id.includes('katex')) {
              return 'markdown';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs')) return 'charts';
            if (id.includes('jspdf') || id.includes('docx') || id.includes('file-saver')) return 'pdf';
            if (id.includes('framer-motion') || id.includes('gsap') || id.includes('lucide-react')) return 'ui';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('react-helmet')) {
              return 'vendor';
            }
            return undefined;
          },
        },
      },
    },
  };
});
