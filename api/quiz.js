// /api/quiz.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not set" });
  }

  try {
    const { notes, quizType } = req.body;

    if (!notes) {
      return res.status(400).json({ error: "Missing notes for quiz generation" });
    }

    const prompt = `Create a ${quizType || "multiple choice"} quiz based on the following notes:\n\n${notes}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({ error: "Invalid response from OpenAI API" });
    }

    return res.status(200).json({ result: answer });
  } catch (error) {
    console.error("Quiz API error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
