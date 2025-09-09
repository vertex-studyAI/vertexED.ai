import fetch from "node-fetch"; // only needed if using Node <18

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Read the environment variable
  const OPENAI_API_KEY = process.env.ChatbotKey; // or process.env.OPENAI_API_KEY if you rename it in Vercel

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not set" });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
      }),
    });

    const data = await response.json();

    // Validate response
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("OpenAI response invalid:", data);
      return res.status(500).json({ error: "Invalid response from OpenAI API" });
    }

    // Send answer back
    res.status(200).json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}
