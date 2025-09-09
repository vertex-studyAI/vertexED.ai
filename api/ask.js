export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "No question provided" });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not set" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
      }),
    });

    const data = await response.json();

    // Check if the response has choices
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("OpenAI response invalid:", data);
      return res.status(500).json({ error: "Invalid response from OpenAI API" });
    }

    res.status(200).json({ answer: data.choices[0].message.content });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}
