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
    const { topic, format, length = "medium", flashCount = 8 } = req.body || {};
    if (!topic) return res.status(400).json({ error: "Missing topic" });

    // Build a length hint
    let lengthHint = "";
    if (length === "short") lengthHint = "Keep the notes short and concise (approx. ~100-200 words).";
    else if (length === "long") lengthHint = "Provide more thorough notes (approx. ~500-800 words).";
    else lengthHint = "Keep notes concise but informative (approx. ~250-400 words).";

    const notesPrompt = `Create ${format} style notes for the topic below. ${lengthHint} Use clear plain-text formatting (headings, paragraphs, and simple lists). Include LaTeX for any equations (wrap as $$...$$). Avoid HTML tags and avoid returning Markdown code fences. Make the content study-friendly and concise.

Topic: ${topic}`;

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

    // Strip HTML tags while preserving LaTeX $$...$$ blocks.
    // Strategy: temporarily protect $$...$$ blocks, strip HTML, then restore.
    const latexPlaceholders = [];
    const latexProtected = rawNotes.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
      const key = `___LATEX_PLACEHOLDER_${latexPlaceholders.length}___`;
      latexPlaceholders.push(match);
      return key;
    });
    // remove HTML tags from the rest
    const stripped = latexProtected.replace(/<\/?[^>]+(>|$)/g, "");
    // restore LaTeX
    let plainNotes = stripped;
    latexPlaceholders.forEach((block, i) => {
      plainNotes = plainNotes.replace(`___LATEX_PLACEHOLDER_${i}___`, block);
    });
    // trim any leading/trailing whitespace
    plainNotes = plainNotes.trim();

    // Next: create flashcards from the notes (STRICT JSON)
    const flashPrompt = `From the following notes, create an array of flashcards (front/back). Output STRICT JSON only. Provide between 4 and ${Math.max(4, Math.min(16, Number(flashCount || 8)))} flashcards.

Notes: ${plainNotes}

Output shape:
{
  "flashcards": [
    { "front": "question or prompt", "back": "answer or explanation (can contain short LaTeX if needed)" }
  ]
}`;

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

    // attempt to strip markdown fences/wrappers
    if (flashJson.startsWith("```")) {
      const firstLineBreak = flashJson.indexOf("\n");
      flashJson = flashJson.slice(firstLineBreak + 1);
      if (flashJson.endsWith("```")) flashJson = flashJson.slice(0, -3);
    }
    // Also handle stray leading text
    // Attempt to find the first "{" and last "}" to get JSON
    const firstBrace = flashJson.indexOf("{");
    const lastBrace = flashJson.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      flashJson = flashJson.slice(firstBrace, lastBrace + 1);
    }

    let parsedFlash = { flashcards: [] };
    try {
      parsedFlash = JSON.parse(flashJson);
    } catch (err) {
      console.error("Failed to parse flashcards JSON:", err, "raw:", rawFlash);
      parsedFlash = { flashcards: [] };
    }

    // ensure flashcards is an array and sanitize text
    const finalFlashcards = (parsedFlash.flashcards || []).slice(0, Math.max(4, Math.min(16, Number(flashCount || 8)))).map((f) => ({
      front: (f.front || "").toString(),
      back: (f.back || "").toString(),
    }));

    return res.status(200).json({ result: plainNotes, flashcards: finalFlashcards });
  } catch (err) {
    console.error("Note API error:", err);
    return res.status(500).json({ error: "Failed to generate notes" });
  }
}
