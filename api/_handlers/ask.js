import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { callChatProvider, extractChatAnswer, resolveChatProvider } from '../_lib/aiProviders.js';
import { buildAskMessages } from '../_lib/askPrompt.js';
import { resolveChatRoute } from '../_lib/modelPolicy.js';
import { logProviderRun } from '../_lib/providerTelemetry.js';

const MAX_QUESTION_CHARS = 4000;

function respondAiFailure(res) {
  return res.status(502).json({ error: 'AI request failed. Please try again shortly.' });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res, 256 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'ask', res))) return;

  let providerConfig;
  try {
    providerConfig = resolveChatProvider(process.env);
  } catch (error) {
    console.error('❌ Chat provider configuration error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({
      error: "Server configuration error",
    });
  }

  try {
    const body = readJsonBody(req);

    const { question, history, context, sources, mode } = body ?? {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "No question provided" });
    }

    if (question.length > MAX_QUESTION_CHARS) {
      return res.status(400).json({ error: `Question too long (max ${MAX_QUESTION_CHARS} characters).` });
    }

    const trimmedQuestion = question.trim();
    const route = resolveChatRoute({ mode, providerConfig, env: process.env });
    const telemetryRoute = `ask/${route.mode}`;
    const chatMessages = buildAskMessages({ question: trimmedQuestion, history, context, sources });
    const PRIMARY_MODEL = route.primaryModel;
    const FALLBACK_MODEL = route.fallbackModel;

    const callProvider = async (model) => {
      const startedAt = Date.now();
      try {
        const result = await callChatProvider({
          config: providerConfig,
          model,
          messages: chatMessages,
          temperature: 0.4,
          maxTokens: 1200,
        });
        await logProviderRun({
          capability: 'chatbot',
          route: telemetryRoute,
          provider: result.provider,
          model: result.model,
          status: result.response.status,
          durationMs: Date.now() - startedAt,
        });
        return result;
      } catch (error) {
        await logProviderRun({
          capability: 'chatbot',
          route: telemetryRoute,
          provider: providerConfig.name,
          model,
          durationMs: Date.now() - startedAt,
          error: true,
        });
        throw error;
      }
    };

    let { response, raw, model: resolvedModel, provider } = await callProvider(PRIMARY_MODEL);

    // Fallback remains inside the explicitly configured provider. Routing chooses a
    // model role, never a different provider, so provider changes cannot happen silently.
    if (!response.ok && FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL && response.status !== 401) {
      console.warn(
        `⚠️ Primary chatbot model failed (${provider}/${PRIMARY_MODEL}, mode ${route.mode}, status ${response.status}). Retrying with fallback model (${FALLBACK_MODEL}).`,
      );
      ({ response, raw, model: resolvedModel, provider } = await callProvider(FALLBACK_MODEL));
    }

    console.log("AI provider status:", response.status, "provider:", provider, "model:", resolvedModel, "mode:", route.mode);

    if (!response.ok) {
      console.error("❌ AI provider error:", response.status, provider, resolvedModel);
      return respondAiFailure(res);
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("❌ Invalid JSON from AI provider:", provider, resolvedModel);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    let answer = extractChatAnswer(data);

    // Some models can return empty output. Treat that as failure and retry only
    // with an explicitly configured fallback model on the same provider.
    if (!answer && FALLBACK_MODEL && FALLBACK_MODEL !== resolvedModel) {
      console.warn(
        `⚠️ Model returned empty output (${provider}/${resolvedModel}, mode ${route.mode}). Retrying with fallback model (${FALLBACK_MODEL}).`,
      );

      const fallbackCall = await callProvider(FALLBACK_MODEL);
      resolvedModel = fallbackCall.model;
      raw = fallbackCall.raw;
      response = fallbackCall.response;
      provider = fallbackCall.provider;

      console.log("AI provider status:", response.status, "provider:", provider, "model:", resolvedModel, "mode:", route.mode);

      if (!response.ok) {
        console.error("❌ AI provider fallback error:", response.status, provider, resolvedModel);
        return respondAiFailure(res);
      }

      try {
        data = JSON.parse(raw);
      } catch {
        console.error("❌ Invalid JSON from AI provider fallback:", provider, resolvedModel);
        return res.status(500).json({ error: "Invalid AI response format" });
      }

      answer = extractChatAnswer(data);
    }

    if (!answer) {
      console.error("❌ No answer in AI provider response:", provider, resolvedModel);
      return res.status(500).json({
        error: "AI returned no answer",
      });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("❌ Chat handler failed:", err instanceof Error ? err.name : 'UnknownError');
    return res.status(502).json({ error: "AI request failed. Please try again shortly." });
  }
}
