// /api/ask.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;

  if (!OPENAI_API_KEY) {
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

    // Otherwise, continue to query the fine-tuned model
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "ft:gpt-4.1-mini-2025-04-14:verteded:apex-chatbot:CSdExRCK",
        messages: [{ role: "user", content: question }],
      }),
    });

    const data = await response.json();

    // Validate response
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
      console.error("OpenAI response invalid:", data);
      return res.status(500).json({ error: "Sorry, A.I is currently under maintance" });
    }

    // Send JSON back to frontend
    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
