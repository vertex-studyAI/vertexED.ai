// api/note.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "AI not set" });
  }

  try {
    const {
      topic,
      format = "bullet",
      length = "medium",
      flashCount = 8,
      additionalInfo = "",
      customFormat
    } = req.body || {};

    if (!topic) {
      return res.status(400).json({ error: "Missing topic" });
    }

    const safeFlashCount = Math.max(4, Math.min(16, Number(flashCount || 8)));

    let lengthHint = "Keep notes concise but informative (~250-400 words).";
    if (length === "short") lengthHint = "Keep notes short (~100-200 words).";
    if (length === "long") lengthHint = "Provide detailed notes (~500-800 words).";

    const formatLabel = format.toLowerCase() === "custom"
      ? (customFormat || "Custom")
      : format;

    const systemMessage = {
      role: "system",
      content:
        "You are an expert study assistant. " +
        "Produce study notes with clear structure: short headings, bullet lists, examples. " +
        "Always preserve LaTeX as $$...$$. " +
        "Always return two blocks: " +
        "1) NOTES (Markdown, plain text, can include Markdown tables). " +
        "2) FLASHCARDS_JSON (strict JSON: { flashcards: [], tables: [], charts: [] }). " +
        "Each table row may include optional 'options' array for multiple-choice style content."
    };

    const userMessage = {
      role: "user",
      content:
        `Create ${formatLabel} style study notes for this topic. ${lengthHint}
Include headings, bullet points, LaTeX math, and small example tables when relevant.
Return at the end a strict JSON block labeled FLASHCARDS_JSON.

Topic: ${topic}
Extra info: ${additionalInfo || "none"}

Rules:
- Notes must be clean, Markdown-friendly, no HTML.
- Preserve $$...$$ blocks.
- Flashcards: 4–${safeFlashCount}.
- JSON block shape:
  {
    "flashcards": [ { "front": "Q?", "back": "A" } ],
    "tables": [ { "headers": ["h1","h2"], "rows": [ ["a","b"], ... ], "options": [["opt1","opt2"],...] } ],
    "charts": [ { "type": "bar", "labels": ["x","y"], "values": [1,2] } ]
  }`
    };

    // --- Fetch completion ---
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        // ⬇️ Updated model reference here
        model: "ft:gpt-4o-mini-2024-07-18:verteded:notes:CRuakY3O",
        messages: [systemMessage, userMessage],
        temperature: 0.45,
        max_tokens: 1600,
      }),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // --- Protect LaTeX before splitting ---
    const latexBlocks = [];
    const protectedRaw = raw.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
      const key = `__LATEX_${latexBlocks.length}__`;
      latexBlocks.push(m);
      return key;
    });

    // --- Split notes & JSON ---
    let notesText = protectedRaw;
    let flashJsonText = null;

    const markerMatch = protectedRaw.match(/FLASHCARDS_JSON[:\s]*({[\s\S]*})/m);
    if (markerMatch) {
      flashJsonText = markerMatch[1];
      notesText = protectedRaw.replace(markerMatch[0], "").trim();
    }

    if (!flashJsonText) {
      // fallback: last JSON-looking block
      const match = protectedRaw.match(/({[\s\S]*})\s*$/m);
      if (match) {
        flashJsonText = match[1];
        notesText = protectedRaw.replace(match[0], "").trim();
      }
    }

    // --- Parse JSON block ---
    let parsed = { flashcards: [], tables: [], charts: [] };
    if (flashJsonText) {
      try {
        parsed = JSON.parse(flashJsonText);
      } catch {
        // try relaxed parse
        try {
          parsed = JSON.parse(flashJsonText.replace(/```json|```/g, ""));
        } catch {
          parsed = { flashcards: [], tables: [], charts: [] };
        }
      }
    }

    // --- Sanitize flashcards ---
    const finalFlashcards = (parsed.flashcards || [])
      .slice(0, safeFlashCount)
      .map((f) => ({
        front: (f.front || f.question || "").toString().trim(),
        back: (f.back || f.answer || "").toString().trim(),
      }));

    // --- Sanitize tables ---
    const finalTables = (parsed.tables || []).map((t) => ({
      headers: t.headers || [],
      rows: t.rows || [],
      options: t.options || [],
    }));

    // --- Charts ---
    const finalCharts = parsed.charts || [];

    // --- Restore LaTeX ---
    latexBlocks.forEach((block, i) => {
      notesText = notesText.replace(`__LATEX_${i}__`, block);
    });

    const summary = notesText.split("\n\n")[0] || `Notes on ${topic}`;

    return res.status(200).json({
      result: notesText.trim(),
      summary,
      flashcards: finalFlashcards,
      structured: { tables: finalTables, charts: finalCharts },
    });
  } catch (err) {
    console.error("Note API error:", err);
    return res.status(500).json({ error: "Failed to generate notes" });
  }
}
