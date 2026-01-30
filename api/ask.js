export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.CHATBOT_KEY;

  if (!OPENAI_API_KEY) {
    console.error("❌ Missing CHATBOT_KEY env var");
    return res.status(500).json({
      error: "Server configuration error",
    });
  }

  try {
    const { question } = req.body ?? {};

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

    // ✅ Use Responses API (CURRENT)
    const payload = {
      model: "ft:gpt-4.1-mini-2025-04-14:verteded:apex-chatbot:CSgJ1mRt",
      input: question,
      temperature: 0.4,
      max_output_tokens: 600,
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();

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
    } catch {
      console.error("❌ Invalid JSON from OpenAI:", raw);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    // ✅ Robust extraction (no assumptions)
    const answer =
      data?.output_text ??
      data?.output?.[0]?.content?.[0]?.text ??
      null;

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
