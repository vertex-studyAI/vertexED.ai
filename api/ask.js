const DEFAULT_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 20000);

function getOpenAiKey() {
  return (
    process.env.OPENAI_API_KEY ||
    process.env.ChatbotKey ||
    process.env.CHATBOT_KEY ||
    process.env.VITE_OPENAI_API_KEY ||
    process.env.VITE_CHATBOT_KEY ||
    ""
  ).trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = getOpenAiKey();

  if (!OPENAI_API_KEY) {
    console.error(
      "❌ Missing OpenAI API key env var (set OPENAI_API_KEY or ChatbotKey)",
    );
    return res.status(500).json({
      error: "Server configuration error",
    });
  }

  try {
    let body = req.body ?? {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { question } = body ?? {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "No question provided" });
    }

    // 🔐 Secret code logic
    const secretCodes = ["010910", "060910"];
    if (secretCodes.includes(question.trim())) {
      return res.status(200).json({
        answer: "I wish it too (secret code)",
      });
    }

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
        messages: [{ role: "user", content: question }],
        temperature: 0.4,
        max_tokens: 600,
      };

      const controller = new AbortController();
      const timeoutMs = Number.isFinite(DEFAULT_TIMEOUT_MS) && DEFAULT_TIMEOUT_MS > 0 ? DEFAULT_TIMEOUT_MS : 20000;
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          },
        );

        const raw = await response.text();
        return { response, raw, model };
      } finally {
        clearTimeout(timer);
      }
    };

    let { response, raw, model } = await callOpenAI(PRIMARY_MODEL);

    // If the fine-tuned model is unavailable (common on new keys), fall back.
    if (!response.ok && FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL && response.status !== 401) {
      console.warn(
        `⚠️ Primary chatbot model failed (${PRIMARY_MODEL}, status ${response.status}). Retrying with fallback model (${FALLBACK_MODEL}).`,
      );
      ({ response, raw, model } = await callOpenAI(FALLBACK_MODEL));
    }

    if (process.env.NODE_ENV !== "production" || process.env.DEBUG_AI) {
      if (process.env.NODE_ENV !== "production" || process.env.DEBUG_AI) {
        console.log("OpenAI status:", response.status, "model:", model);
        console.log("OpenAI raw:", raw.slice(0, 1000));
      }
    }

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

      if (process.env.NODE_ENV !== "production" || process.env.DEBUG_AI) {
        console.log("OpenAI status:", response.status, "model:", model);
        console.log("OpenAI raw:", raw.slice(0, 1000));
      }

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

    return res.status(200).json({ answer, model });
  } catch (err) {
    console.error("❌ Server crash:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
