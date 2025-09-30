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
    const { topic, format = "bullet", length = "medium", flashCount = 8 } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: "Missing topic" });
    }

    // Length hint for notes
    const lengthHint =
      length === "short"
        ? "Keep the notes short and concise (~100-200 words)."
        : length === "long"
        ? "Provide more thorough notes (~500-800 words)."
        : "Keep notes concise but informative (~250-400 words).";

    const notesPrompt = `Create ${format} style notes for the topic below. ${lengthHint}
Use clear plain-text formatting (headings, paragraphs, and simple lists).
Include LaTeX for equations (wrap in $$...$$). Avoid HTML tags and Markdown code fences.

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

    // Strip HTML but preserve LaTeX
    const latexBlocks = [];
    let protectedNotes = rawNotes.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
      const key = `__LATEX_${latexBlocks.length}__`;
      latexBlocks.push(match);
      return key;
    });
    protectedNotes = protectedNotes.replace(/<\/?[^>]+(>|$)/g, ""); // strip HTML
    let plainNotes = protectedNotes.trim();
    latexBlocks.forEach((block, i) => {
      plainNotes = plainNotes.replace(`__LATEX_${i}__`, block);
    });

    // Flashcards
    const safeFlashCount = Math.max(4, Math.min(16, Number(flashCount || 8)));
    const flashPrompt = `From the following notes, create an array of flashcards.
Output STRICT JSON only.

Notes:
${plainNotes}

Output shape:
{
  "flashcards": [
    { "front": "question or prompt", "back": "answer or explanation (can contain short LaTeX)" }
  ]
}
Number of flashcards: ${safeFlashCount}`;

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
    let flashRaw = flashData.choices?.[0]?.message?.content || "";

    // Clean JSON output
    if (flashRaw.startsWith("```")) {
      flashRaw = flashRaw.replace(/```(json)?/g, "").trim();
    }
    const firstBrace = flashRaw.indexOf("{");
    const lastBrace = flashRaw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      flashRaw = flashRaw.slice(firstBrace, lastBrace + 1);
    }

    let parsedFlash = { flashcards: [] };
    try {
      parsedFlash = JSON.parse(flashRaw);
    } catch (e) {
      console.error("Flashcard JSON parse error:", e, flashRaw);
    }

    const finalFlashcards = (parsedFlash.flashcards || [])
      .slice(0, safeFlashCount)
      .map((f) => ({
        front: (f.front || "").toString().trim(),
        back: (f.back || "").toString().trim(),
      }));

    return res.status(200).json({
      result: plainNotes,
      flashcards: finalFlashcards,
    });
  } catch (err) {
    console.error("Note API error:", err);
    return res.status(500).json({ error: "Failed to generate notes" });
  }
}
