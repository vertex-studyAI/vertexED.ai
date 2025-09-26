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

    // Force JSON structure from OpenAI
    const prompt = `
      Create a ${quizType || "Multiple Choice"} quiz based on the following notes:

      ${notes}

      Format the response strictly as valid JSON:
      {
        "questions": [
          {
            "question": "string",
            "options": ["A", "B", "C", "D"], 
            "answer": "A"
          }
        ]
      }
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
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({ error: "Invalid response from OpenAI API" });
    }

    let parsed = {};
    try {
      parsed = JSON.parse(answer);
    } catch (err) {
      console.error("Failed to parse AI response:", err);
      return res.status(500).json({ error: "Could not parse quiz output." });
    }

    // Always return the shape frontend expects
    return res.status(200).json({
      questions: parsed.questions || [],
    });
  } catch (error) {
    console.error("Quiz API error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
