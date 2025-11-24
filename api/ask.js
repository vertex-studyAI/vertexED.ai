// /api/ask.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  if (!OPENAI_API_KEY) {
    // Friendly message for users; still log for operators
    console.error("Missing ChatbotKey env var (process.env.ChatbotKey)");
    return res.status(500).json({ error: "We have a problem, don't worry it'll be fixed soon" });
  }

  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const secretCodes = ["010910", "060910"];
    if (secretCodes.includes(question.trim())) {
      return res.status(200).json({ answer: "I wish it too (secret code)" });
    }

    const payload = {
      // Note: corrected prefix "ft:" and proper quoted string
      model: "ft:gpt-4.1-mini-2025-04-14:verteded:apex-chatbot:CSgJ1mRt",
      messages: [{ role: "user", content: question }],
      // optionally include: max_tokens, temperature, etc.
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // Read raw text (always safe)
    const raw = await response.text();

    // Log helpful debug info
    console.log("OpenAI status:", response.status, response.statusText);
    console.log("OpenAI content-type:", response.headers.get("content-type"));
    console.log("OpenAI raw body (truncated 2000 chars):", raw?.slice?.(0, 2000));

    // If non-OK, return useful info for debugging (remove raw body in prod)
    if (!response.ok) {
      let parsedError = null;
      const ct = (response.headers.get("content-type") || "").toLowerCase();
      if (ct.includes("application/json")) {
        try { parsedError = JSON.parse(raw); } catch (e) { parsedError = raw; }
      } else {
        parsedError = raw;
      }
      console.error("OpenAI returned non-OK:", response.status, parsedError);
      return res.status(response.status).json({
        error: "OpenAI API error",
        details: parsedError,
      });
    }

    // Parse JSON only if content-type says JSON
    let data = null;
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse JSON from OpenAI:", e, "raw:", raw);
        return res.status(500).json({ error: "Invalid JSON from OpenAI", raw_body: raw });
      }
    } else {
      // Unexpected but handle gracefully
      console.warn("OpenAI returned non-JSON success response. Raw:", raw);
      return res.status(500).json({ error: "Unexpected response format from AI", raw_body: raw });
    }

    // Accept chat or completion style shapes
    const answer =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      null;

    if (!answer) {
      console.error("OpenAI response missing expected fields:", data);
      return res.status(500).json({ error: "Sorry, A.I is currently under maintenance", raw: data });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
