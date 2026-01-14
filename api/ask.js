// /pages/api/ask.js  (IMPORTANT: must be under /pages/api, not /api root)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;

  if (!OPENAI_API_KEY) {
    console.error("❌ Missing ChatbotKey env var");
    return res.status(500).json({
      error: "Server configuration error. Please try again later.",
    });
  }

  try {
    // ✅ Ensure body is parsed
    const { question } = req.body || {};

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "No question provided" });
    }

    // ✅ Secret code logic (safe)
    const secretCodes = ["010910", "060910"];
    if (secretCodes.includes(question.trim())) {
      return res.status(200).json({ answer: "I wish it too (secret code)" });
    }

    // ✅ Correct payload for Chat Completions
    const payload = {
      model: "ft:gpt-4.1-mini-2025-04-14:verteded:apex-chatbot:CSgJ1mRt",
      messages: [{ role: "user", content: question }],
      temperature: 0.4,
      max_tokens: 600,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();

    // 🔍 Debug logging (safe to keep during dev)
    console.log("OpenAI status:", response.status);
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
        details,
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Invalid JSON from OpenAI:", raw);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    const answer = data?.choices?.[0]?.message?.content;

    if (!answer) {
      console.error("❌ Missing answer field:", data);
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
