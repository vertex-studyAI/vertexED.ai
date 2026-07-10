import { verifyAuthUser, readJsonBody } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

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

    const { question, history, context } = body ?? {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "No question provided" });
    }

    const buildMessages = () => {
      const messages = [];

      if (context && typeof context === "object") {
        const label = typeof context.label === "string" ? context.label : "VertexED";
        const hint = typeof context.hint === "string" ? context.hint : "";
        messages.push({
          role: "system",
          content: `You are Apex, a discussion-first study assistant on VertexED. The student is currently on: ${label}. ${hint} Deliberate step-by-step; ask clarifying questions when helpful.`,
        });
      }

      if (Array.isArray(history)) {
        for (const entry of history.slice(-10)) {
          const role = entry?.role === "assistant" ? "assistant" : "user";
          const text = typeof entry?.text === "string" ? entry.text.trim() : "";
          if (text) messages.push({ role, content: text.slice(0, 2000) });
        }
      }

      messages.push({ role: "user", content: question.trim() });
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
        max_tokens: 600,
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
    console.log("OpenAI raw:", raw.slice(0, 1000));

    if (!response.ok) {
      let details;
      try {
        details = JSON.parse(raw);
      } catch {
        details = raw;
      }

      console.error("❌ OpenAI error:", details);
      return res.status(response.status).json({
        error: "AI request failed",
        model,
        details,
      });
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
      console.log("OpenAI raw:", raw.slice(0, 1000));

      if (!response.ok) {
        let details;
        try {
          details = JSON.parse(raw);
        } catch {
          details = raw;
        }

        console.error("❌ OpenAI error:", details);
        return res.status(response.status).json({
          error: "AI request failed",
          model,
          details,
        });
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
