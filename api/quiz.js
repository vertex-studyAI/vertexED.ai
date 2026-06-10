import OpenAI from "openai";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 20_000;

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

function readBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function buildPrompt({ mode, source, topic, text, flashCount, length }) {
  if (mode === "notes") {
    if (source === "topic") {
      if (!topic?.trim()) return null;
      return `Create clear, student-friendly study notes on the topic below.

Topic:
"${topic.trim()}"

Guidelines:
- Length: ${length}
- Natural explanation style
- Minimal bullets
- Clear reasoning
`;
    }

    if (source === "audio") {
      if (!text?.trim()) return null;
      return `Convert the following transcription into clean study notes.
Make them clear, structured, and concise.

Transcription:
${text.trim()}
`;
    }
  }

  if (mode === "flashcards") {
    if (!text?.trim()) return null;
    return `Generate ${flashCount} flashcards from the notes below.

Rules:
- JSON ONLY
- No markdown
- No explanations
- Each item must have "question" and "answer"

Notes:
${text.trim()}

Return EXACTLY:
{
  "flashcards": [
    { "question": "...", "answer": "..." }
  ]
}
`;
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = getOpenAiKey();
  if (!apiKey) {
    return res.status(500).json({
      error: "Server configuration error: missing OpenAI API key",
    });
  }

  try {
    const body = readBody(req.body);
    const mode = body.mode === "flashcards" ? "flashcards" : "notes";
    const source = body.source === "audio" ? "audio" : "topic";
    const topic = typeof body.topic === "string" ? body.topic : "";
    const text = typeof body.text === "string" ? body.text : "";
    const flashCount = clampNumber(body.flashCount, 4, 24, 6);
    const length = ["short", "medium", "long"].includes(body.length) ? body.length : "medium";

    const prompt = buildPrompt({ mode, source, topic, text, flashCount, length });
    if (!prompt) {
      return res.status(400).json({ error: "Invalid request payload" });
    }

    const client = new OpenAI({ apiKey });

    const controller = new AbortController();
    const timeoutMs = Number.isFinite(DEFAULT_TIMEOUT_MS) ? DEFAULT_TIMEOUT_MS : 20_000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let raw = "";
    try {
      const completion = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: mode === "flashcards" ? 900 : 1200,
        signal: controller.signal,
      });
      raw = completion.choices?.[0]?.message?.content ?? "";
    } finally {
      clearTimeout(timer);
    }

    if (!raw.trim()) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    if (mode === "flashcards") {
      try {
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}") + 1;
        const clean = raw.slice(start, end);
        const parsed = JSON.parse(clean);
        return res.status(200).json({
          flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
        });
      } catch (error) {
        console.error("Flashcard parse error:", raw);
        return res.status(500).json({ error: "Failed to parse flashcards" });
      }
    }

    return res.status(200).json({
      notes: raw.trim(),
    });
  } catch (error) {
    console.error("API /api/quiz crash:", error);
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "AI request timed out"
        : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
