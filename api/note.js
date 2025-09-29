import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not set" });
  }

  try {
    const { topic, format } = req.body;
    if (!topic) return res.status(400).json({ error: "Missing topic" });

    const prompt = `
      Create notes in ${format} style for the following topic:
      ${topic}

      Use LaTeX for equations and ensure the output is HTML-friendly (paragraphs, lists, headings).
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const notes = data.choices?.[0]?.message?.content || "";

    res.json({ result: notes });
  } catch (err) {
    console.error("Note API error:", err);
    res.status(500).json({ error: "Failed to generate notes" });
  }
}
