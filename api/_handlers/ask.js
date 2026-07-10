import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { formatSourcesForPrompt, GROUNDED_CHAT_RULES } from '../_lib/grounding.js';

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
  if (!rateLimitUserEndpoint(user.id, 'ask', res)) return;

  const OPENAI_API_KEY =
    process.env.OPENAI_API_KEY ||
    process.env.ChatbotKey ||
    process.env.CHATBOT_KEY;

  if (!OPENAI_API_KEY) {
    console.error(
      "❌ Missing OpenAI API key env var (set OPENAI_API_KEY or ChatbotKey)",
    );
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
        for (const entry of history.slice(-10)) {
          const role = entry?.role === "assistant" ? "assistant" : "user";
          const text = typeof entry?.text === "string" ? entry.text.trim() : "";
          if (text) messages.push({ role, content: text.slice(0, 2000) });
        }
      }

      messages.push({ role: "user", content: trimmedQuestion });
      return messages;
    };

    const chatMessages = buildMessages();

    const PRIMARY_MODEL =
      process.env.CHATBOT_MODEL ||
      "ft:gpt-4.1-mini-2025-04-14:verteded:apex-chatbot:CSgJ1mRt";
    const FALLBACK_MODEL = process.env.CHATBOT_FALLBACK_MODEL || "gpt-4o-mini";

    const extractAnswer = (data) => {
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim()) return content.trim();
      const refusal = data?.choices?.[0]?.message?.refusal;
      if (typeof refusal === "string" && refusal.trim()) return refusal.trim();
      const text = data?.choices?.[0]?.text;
      if (typeof text === "string" && text.trim()) return text.trim();

      const outputText = data?.output_text;
      if (typeof outputText === "string" && outputText.trim()) return outputText.trim();
      const responseText = data?.output?.[0]?.content?.[0]?.text;
      if (typeof responseText === "string" && responseText.trim()) return responseText.trim();

      return null;
    };

    const callOpenAI = async (model) => {
      const payload = {
        model,
        messages: chatMessages,
        temperature: 0.4,
        max_tokens: 1200,
      };

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const raw = await response.text();
      return { response, raw, model };
    };

    let { response, raw, model } = await callOpenAI(PRIMARY_MODEL);

    // If the fine-tuned model is unavailable (common on new keys), fall back.
    if (!response.ok && FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL && response.status !== 401) {
      console.warn(
        `⚠️ Primary chatbot model failed (${PRIMARY_MODEL}, status ${response.status}). Retrying with fallback model (${FALLBACK_MODEL}).`,
      );
      ({ response, raw, model } = await callOpenAI(FALLBACK_MODEL));
    }

    console.log("OpenAI status:", response.status, "model:", model);

    if (!response.ok) {
      console.error("❌ OpenAI error:", response.status, model);
      return respondAiFailure(res);
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("❌ Invalid JSON from OpenAI:", raw);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    let answer = extractAnswer(data);

    // Some fine-tunes can return empty output (content: ""). Treat that as failure.
    if (!answer && FALLBACK_MODEL && FALLBACK_MODEL !== model) {
      console.warn(
        `⚠️ Model returned empty output (${model}). Retrying with fallback model (${FALLBACK_MODEL}).`,
      );

      const fallbackCall = await callOpenAI(FALLBACK_MODEL);
      model = fallbackCall.model;
      raw = fallbackCall.raw;
      response = fallbackCall.response;

      console.log("OpenAI status:", response.status, "model:", model);

      if (!response.ok) {
        console.error("❌ OpenAI fallback error:", response.status, model);
        return respondAiFailure(res, 502);
      }

      try {
        data = JSON.parse(raw);
      } catch {
        console.error("❌ Invalid JSON from OpenAI:", raw);
        return res.status(500).json({ error: "Invalid AI response format" });
      }

      answer = extractAnswer(data);
    }

    if (!answer) {
      console.error("❌ No answer in OpenAI response:", data);
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
