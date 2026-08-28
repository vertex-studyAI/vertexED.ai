import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { formatSourcesForPrompt, GROUNDED_CHAT_RULES } from '../_lib/grounding.js';
import { callChatProvider, extractChatAnswer, resolveChatProvider } from '../_lib/aiProviders.js';

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
    console.error('❌ Chat provider configuration error:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({
      error: "Server configuration error",
    });
  }

  try {
    const body = readJsonBody(req);

    const { question, history, context, sources } = body ?? {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "No question provided" });
    }

    if (question.length > MAX_QUESTION_CHARS) {
      return res.status(400).json({ error: `Question too long (max ${MAX_QUESTION_CHARS} characters).` });
    }

    const trimmedQuestion = question.trim();

    const buildMessages = () => {
      const messages = [];

      if (context && typeof context === "object") {
        const label =
          typeof context.label === "string"
            ? context.label.trim().slice(0, 120)
            : "VertexED";
        const hint =
          typeof context.hint === "string"
            ? context.hint.trim().slice(0, 2000)
            : "";
        messages.push({
          role: "system",
          content: `You are Apex, VertexED's discussion-first study tutor. The student is on: ${label}. ${hint}

Rules:
- Deliberate step-by-step; ask what they've tried before giving full solutions.
- Prefer Socratic follow-ups over dumping answers.
- Use clear structure for math (steps, not just final values).
- When relevant, reference exam technique, command terms, and mark-scheme thinking.
- Keep responses focused; if a topic is large, offer a sensible first step and invite follow-up.`,
        });
      }

      const sourceBlock = formatSourcesForPrompt(sources);
      if (sourceBlock && messages.length > 0) {
        messages[0].content += `\n\n${GROUNDED_CHAT_RULES}\n\n${sourceBlock}`;
      } else if (sourceBlock) {
        messages.push({
          role: "system",
          content: `${GROUNDED_CHAT_RULES}\n\n${sourceBlock}`,
        });
      }

      if (Array.isArray(history)) {
        const recentHistory = history.slice(-10);
        for (const [index, entry] of recentHistory.entries()) {
          const role = entry?.role === "assistant" ? "assistant" : "user";
          const text = typeof entry?.text === "string" ? entry.text.trim() : "";
          const duplicatesCurrentQuestion =
            index === recentHistory.length - 1 && role === "user" && text === trimmedQuestion;
          if (text && !duplicatesCurrentQuestion) messages.push({ role, content: text.slice(0, 2000) });
        }
      }

      messages.push({ role: "user", content: trimmedQuestion });
      return messages;
    };

    const chatMessages = buildMessages();
    const PRIMARY_MODEL = providerConfig.primaryModel;
    const FALLBACK_MODEL = providerConfig.fallbackModel;

    const callProvider = (model) =>
      callChatProvider({
        config: providerConfig,
        model,
        messages: chatMessages,
        temperature: 0.4,
        maxTokens: 1200,
      });

    let { response, raw, model, provider } = await callProvider(PRIMARY_MODEL);

    // Preserve the existing OpenAI fallback behavior and allow an explicitly configured
    // provider-specific fallback without ever switching providers implicitly.
    if (!response.ok && FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL && response.status !== 401) {
      console.warn(
        `⚠️ Primary chatbot model failed (${provider}/${PRIMARY_MODEL}, status ${response.status}). Retrying with fallback model (${FALLBACK_MODEL}).`,
      );
      ({ response, raw, model, provider } = await callProvider(FALLBACK_MODEL));
    }

    console.log("AI provider status:", response.status, "provider:", provider, "model:", model);

    if (!response.ok) {
      console.error("❌ AI provider error:", response.status, provider, model);
      return respondAiFailure(res);
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("❌ Invalid JSON from AI provider:", provider, model);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    let answer = extractChatAnswer(data);

    // Some models can return empty output. Treat that as failure and retry only
    // with an explicitly configured fallback model on the same provider.
    if (!answer && FALLBACK_MODEL && FALLBACK_MODEL !== model) {
      console.warn(
        `⚠️ Model returned empty output (${provider}/${model}). Retrying with fallback model (${FALLBACK_MODEL}).`,
      );

      const fallbackCall = await callProvider(FALLBACK_MODEL);
      model = fallbackCall.model;
      raw = fallbackCall.raw;
      response = fallbackCall.response;
      provider = fallbackCall.provider;

      console.log("AI provider status:", response.status, "provider:", provider, "model:", model);

      if (!response.ok) {
        console.error("❌ AI provider fallback error:", response.status, provider, model);
        return respondAiFailure(res);
      }

      try {
        data = JSON.parse(raw);
      } catch {
        console.error("❌ Invalid JSON from AI provider fallback:", provider, model);
        return res.status(500).json({ error: "Invalid AI response format" });
      }

      answer = extractChatAnswer(data);
    }

    if (!answer) {
      console.error("❌ No answer in AI provider response:", provider, model);
      return res.status(500).json({
        error: "AI returned no answer",
      });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("❌ Server crash:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
