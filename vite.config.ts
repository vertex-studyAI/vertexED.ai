import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import vue from "@vitejs/plugin-vue"; 
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
      vue(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use('/api/review', async (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', async () => {
                try {
                  // Basic body parsing
                  const parsedBody = body ? JSON.parse(body) : {};
                  
                  // Mock Next.js Request/Response
                  const nextReq = { 
                    ...req, 
                    body: parsedBody, 
                    query: {},
                    method: req.method,
                    headers: req.headers // Pass headers through
                  };
                  
                  const nextRes = {
                    status: (code) => {
                      res.statusCode = code;
                      return nextRes;
                    },
                    json: (data) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return nextRes;
                    },
                    setHeader: (k, v) => res.setHeader(k, v),
                    end: (data) => res.end(data),
                  };

                  // Ensure env vars are available
                  const OPENAI_API_KEY = env.ChatbotKey || process.env.ChatbotKey;
                  const WORKFLOW_ID = env.WORKFLOW_ID || process.env.WORKFLOW_ID;

                  if (!OPENAI_API_KEY || !WORKFLOW_ID) {
                    console.error("Missing ChatbotKey or WORKFLOW_ID");
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      error: "Server misconfiguration: Missing ChatbotKey or WORKFLOW_ID. Check .env.local",
                      missingKeys: {
                        ChatbotKey: !OPENAI_API_KEY,
                        WORKFLOW_ID: !WORKFLOW_ID
                      }
                    }));
                    return;
                  }

                  try {
                    const { input_as_text, prompt, questionImages, answerImages } = parsedBody;
                    let combinedInput = String(input_as_text || prompt || "").trim();

                    const hasQuestionImages = questionImages && questionImages.length > 0;
                    const hasAnswerImages = answerImages && answerImages.length > 0;

                    if (!combinedInput && !hasQuestionImages && !hasAnswerImages) {
                      res.statusCode = 400;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ error: "No input provided" }));
                      return;
                    }

                    if (hasQuestionImages) {
                      combinedInput += `\n\n[User has attached ${questionImages.length} image(s) for the QUESTION]`;
                    }
                    if (hasAnswerImages) {
                      combinedInput += `\n\n[User has attached ${answerImages.length} image(s) for the ANSWER]`;
                    }

                    const allImages = [...(questionImages || []), ...(answerImages || [])];

                    console.log("Executing local OpenAI Agent Workflow...");
                    
                    // Set the env var expected by the agent workflow
                    process.env.OPENAI_API_KEY = OPENAI_API_KEY;

                    // Dynamic import to ensure env vars are set and to load the TS file
                    const { runWorkflow } = await import('./src/api/agentWorkflow.ts');

                    const result = await runWorkflow({
                      input_as_text: combinedInput,
                      images: allImages
                    });

                    console.log("Workflow execution successful");

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(result));


                  } catch (innerError) {
                    console.error("Inner API Logic Error:", innerError);
                    throw innerError;
                  }

                } catch (e) {
                  console.error('API Middleware Error:', e);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: e.message, stack: e.stack }));
                }
              });
            } else {
              next();
            }
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
      rollupOptions: {}
    }
  };
});
