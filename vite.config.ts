import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";

type JsonValue = Record<string, any>;

async function parseBody(req: IncomingMessage): Promise<JsonValue> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", reject);
  });
}

function sendJson(
  res: ServerResponse,
  status: number,
  payload: unknown
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  Object.assign(process.env, env);

  return {
    server: {
      host: "0.0.0.0",
      port: 8080
    },

    plugins: [
      react(),

      {
        name: "vertex-api-middleware",

        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            try {
              if (!req.url) {
                return next();
              }

              // WAITLIST
              if (
                req.url.startsWith("/api/waitlist") &&
                req.method === "POST"
              ) {
                const body = await parseBody(req);

                const { default: handler } = await import(
                  "./api/waitlist.js"
                );

                return handler(
                  {
                    ...req,
                    body
                  },
                  {
                    status(code: number) {
                      res.statusCode = code;
                      return this;
                    },

                    json(data: unknown) {
                      sendJson(res, res.statusCode || 200, data);
                    },

                    setHeader(key: string, value: string) {
                      res.setHeader(key, value);
                    }
                  }
                );
              }

              // ASK
              if (
                req.url.startsWith("/api/ask") &&
                req.method === "POST"
              ) {
                const body = await parseBody(req);

                const { default: handler } = await import(
                  "./api/ask.js"
                );

                return handler(
                  {
                    ...req,
                    body,
                    headers: req.headers
                  },
                  {
                    status(code: number) {
                      res.statusCode = code;
                      return this;
                    },

                    json(data: unknown) {
                      sendJson(res, res.statusCode || 200, data);
                    },

                    setHeader(key: string, value: string) {
                      res.setHeader(key, value);
                    }
                  }
                );
              }

              // REVIEW
              if (
                req.url.startsWith("/api/review") &&
                req.method === "POST"
              ) {
                const body = await parseBody(req);

                const ChatbotKey =
                  env.ChatbotKey || process.env.ChatbotKey;

                const WORKFLOW_ID =
                  env.WORKFLOW_ID || process.env.WORKFLOW_ID;

                if (!ChatbotKey || !WORKFLOW_ID) {
                  return sendJson(res, 500, {
                    error:
                      "Missing ChatbotKey or WORKFLOW_ID"
                  });
                }

                process.env.ChatbotKey = ChatbotKey;

                const { runWorkflow } = await import(
                  "./api/agentWorkflow"
                );

                const result = await runWorkflow({
                  input_as_text: String(
                    body.input_as_text ||
                    body.prompt ||
                    ""
                  ).trim(),

                  images: [
                    ...(body.questionImages || []),
                    ...(body.answerImages || [])
                  ]
                });

                return sendJson(res, 200, result);
              }

              next();
            } catch (error) {
              console.error("Vite Middleware Error:", error);

              const message =
                error instanceof Error
                  ? error.message
                  : "Unknown server error";

              sendJson(res, 500, {
                error: message
              });
            }
          });
        }
      }
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "framer-motion",
        "lucide-react"
      ],

      exclude: [
        "@swc/core"
      ]
    },

    build: {
      target: "esnext",

      sourcemap: false,

      chunkSizeWarningLimit: 1200,

      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "react",
              "react-dom",
              "react-router-dom"
            ],

            animations: [
              "framer-motion",
              "gsap"
            ],

            charts: [
              "chart.js",
              "react-chartjs-2"
            ],

            ai: [
              "@google/generative-ai",
              "openai"
            ],

            utils: [
              "clsx",
              "zod",
              "lodash.debounce"
            ]
          }
        }
      }
    }
  };
});