// api/note.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not set" });
  }

  try {
    const { topic, format } = req.body || {};
    if (!topic) return res.status(400).json({ error: "Missing topic" });

    const notesPrompt = `
Create ${format} style notes for the topic below. Use HTML-friendly formatting (headings, paragraphs, lists).
Include LaTeX for any equations (wrap as $$...$$). Keep the content study-friendly and concise.

Topic:
${topic}
`;

    const notesRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: notesPrompt }],
        temperature: 0.6,
      }),
    });

    const notesData = await notesRes.json();
    const rawNotes = notesData.choices?.[0]?.message?.content || "";
    // The model may return markdown — it's okay, frontend uses dangerouslySetInnerHTML.
    const notes = rawNotes;

    // Next: create flashcards from the notes (strict JSON)
    const flashPrompt = `
From the following notes, create an array of flashcards (front/back). Output STRICT JSON only:

Notes:
${notes}

Output shape:
{
  "flashcards": [
    { "front": "question or prompt", "back": "answer or explanation (can contain short LaTeX if needed)" }
  ]
}
Provide between 4 and 12 flashcards.
`;

    const flashRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: flashPrompt }],
        temperature: 0.7,
      }),
    });

    const flashData = await flashRes.json();
    const rawFlash = flashData.choices?.[0]?.message?.content || "";

    let flashJson = rawFlash.trim();
    if (flashJson.startsWith("```")) {
      const firstLineBreak = flashJson.indexOf("\n");
      flashJson = flashJson.slice(firstLineBreak + 1);
      if (flashJson.endsWith("```")) flashJson = flashJson.slice(0, -3);
    }

    let parsedFlash = { flashcards: [] };
    try {
      parsedFlash = JSON.parse(flashJson);
    } catch (err) {
      console.error("Failed to parse flashcards JSON:", err, "raw:", rawFlash);
      // fallback: return empty flashcards rather than error
      parsedFlash = { flashcards: [] };
    }

    return res.status(200).json({ result: notes, flashcards: parsedFlash.flashcards || [] });
  } catch (err) {
    console.error("Note API error:", err);
    return res.status(500).json({ error: "Failed to generate notes" });
  }
}
