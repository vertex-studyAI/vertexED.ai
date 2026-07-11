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
    },
    plugins: [
      react(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use('/api', (req, res, next) => {
            if (!req.url?.startsWith('/api')) {
              next();
              return;
            }

            const pathname = req.url.split('?')[0];
            const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?') + 1) : '';
            const routeKey = pathname.replace(/^\/api\/?/, '') || 'health';
            const isMultipart = String(req.headers['content-type'] || '').includes('multipart/form-data');
            const queryParams = Object.fromEntries(new URLSearchParams(search));

            const run = async (body: unknown) => {
              try {
                const { dispatchRoute, API_VERSION } = await import('./api/_lib/routes.js');
                const nextReq = {
                  ...req,
                  url: req.url,
                  query: { ...queryParams, path: routeKey.split('/').filter(Boolean) },
                  method: req.method,
                  headers: req.headers,
                  body,
                };
                const nextRes = {
                  status: (code: number) => { res.statusCode = code; return nextRes; },
                  json: (data: unknown) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return nextRes;
                  },
                  setHeader: (k: string, v: string | number | readonly string[]) => res.setHeader(k, v),
                  end: (data?: unknown) => res.end(data as string | undefined),
                  get headersSent() { return res.headersSent; },
                };
                res.setHeader('X-Vertex-API', API_VERSION);
                await dispatchRoute(routeKey, nextReq, nextRes);
              } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                console.error(`/api/${routeKey} Error:`, e);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: message }));
                }
              }
            };

            if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
              void run(undefined);
              return;
            }

            if (isMultipart) {
              void run(undefined);
              return;
            }

            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = body ? JSON.parse(body) : {};
                void run(parsed);
              } catch {
                void run(body);
              }
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
              if (id.includes('/src/components/chat/ChatMarkdown')) {
                return 'chat-markdown';
              }
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
