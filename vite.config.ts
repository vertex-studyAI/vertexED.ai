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
          const mountJsonApi = (route: string, modulePath: string) => {
            server.middlewares.use(route, (req, res, next) => {
              if (req.method !== 'POST') {
                next();
                return;
              }

              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', async () => {
                try {
                  const parsedBody = body ? JSON.parse(body) : {};
                  const nextReq = {
                    ...req,
                    body: parsedBody,
                    query: {},
                    method: req.method,
                    headers: req.headers,
                  };
                  const nextRes = {
                    status: (code: number) => { res.statusCode = code; return nextRes; },
                    json: (data: unknown) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return nextRes;
                    },
                    setHeader: (k: string, v: string) => res.setHeader(k, v),
                  };

                  const { default: handler } = await import(modulePath);
                  await handler(nextReq, nextRes);
                } catch (e: unknown) {
                  const message = e instanceof Error ? e.message : String(e);
                  console.error(`${route} API Error:`, e);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: message }));
                }
              });
            });
          };

          server.middlewares.use('/api/health', async (req, res, next) => {
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              next();
              return;
            }

            try {
              const nextReq = { ...req, method: req.method, headers: req.headers };
              const nextRes = {
                status: (code: number) => { res.statusCode = code; return nextRes; },
                json: (data: unknown) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return nextRes;
                },
              };
              const { default: handler } = await import('./api/health.js');
              await handler(nextReq, nextRes);
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : String(e);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: message }));
            }
          });

          mountJsonApi('/api/waitlist', './api/waitlist.js');
          mountJsonApi('/api/waitlist-admin', './api/waitlist-admin.js');
          mountJsonApi('/api/ask', './api/ask.js');
          mountJsonApi('/api/quiz', './api/quiz.js');
          mountJsonApi('/api/note', './api/note.js');
          mountJsonApi('/api/paper-generator', './api/paper-generator.js');
          mountJsonApi('/api/planner', './api/planner.js');
          mountJsonApi('/api/review-post', './api/review-post.js');
          mountJsonApi('/api/user-content', './api/user-content.js');

          server.middlewares.use('/api/review', (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsedBody = body ? JSON.parse(body) : {};
                const nextReq = {
                  ...req,
                  body: parsedBody,
                  query: {},
                  method: req.method,
                  headers: req.headers,
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
                };

                const { default: handler } = await import('./api/review.ts');
                await handler(nextReq, nextRes);
              } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                console.error('Review API Error:', e);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: message }));
              }
            });
          });

          server.middlewares.use('/api/transcribe', (req, res, next) => {
            if (req.method !== 'POST') {
              next();
              return;
            }

            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            req.on('end', async () => {
              try {
                const rawBody = Buffer.concat(chunks);
                const nextReq = {
                  ...req,
                  body: rawBody,
                  headers: req.headers,
                  method: req.method,
                };
                const nextRes = {
                  status: (code: number) => { res.statusCode = code; return nextRes; },
                  json: (data: unknown) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return nextRes;
                  },
                  setHeader: (k: string, v: string) => res.setHeader(k, v),
                };

                const { default: handler } = await import('./api/transcribe.js');
                await handler(nextReq, nextRes);
              } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                console.error('Transcribe API Error:', e);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: message }));
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
      // PDF/KaTeX bundles are large by nature; warn only for truly extreme outliers
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (id.includes('/src/lib/studyEcosystem') || id.includes('/src/lib/learnerProfile')) {
                return 'ecosystem';
              }
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
