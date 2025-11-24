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

    // Secret codes preserved
    const secretCodes = ["010910", "060910"];
    if (secretCodes.includes(topic.trim())) {
      return res.status(200).json({
        result: "I wish it too (secret code)",
        summary: "Secret code response",
        flashcards: [],
        structured: { tables: [], charts: [] }
      });
    }

    const safeFlashCount = Math.max(4, Math.min(16, Number(flashCount || 8)));

    let lengthHint = "Keep notes concise but informative (~250-400 words).";
    if (length === "short") lengthHint = "Keep notes short (~100-200 words).";
    if (length === "long") lengthHint = "Provide detailed notes (~500-800 words).";

    const formatLabel =
      format.toLowerCase() === "custom" ? (customFormat || "Custom") : format;

    const systemMessage = {
      role: "system",
      content:
        "You are an expert study assistant. " +
        "Produce study notes with clear structure: short headings, bullet lists, examples. " +
        "Preserve LaTeX $$...$$. " +
        "Return exactly two blocks: \n\n" +
        "1) NOTES (Markdown)\n" +
        "2) FLASHCARDS_JSON: { flashcards: [], tables: [], charts: [] }"
    };

    const userMessage = {
      role: "user",
      content:
        `Create ${formatLabel} style study notes. ${lengthHint}
Include headings, bullets, LaTeX, tables, and at the end output:
FLASHCARDS_JSON:
{ "flashcards": [...], "tables": [...], "charts": [...] }

Topic: ${topic}
Extra info: ${additionalInfo || "none"}
Flashcards: 4–${safeFlashCount}`
    };

    // --- Call OpenAI using NEW RESPONSES API ---
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "ft:gpt-4o-mini-2024-07-18:verteded:notes:CRuakY3O",
        input: [systemMessage, userMessage],
        temperature: 0.45,
        max_output_tokens: 1600,
      }),
    });

    const data = await response.json();
    const raw = data.output_text || "";

    // --- Protect LaTeX before splitting ---
    const latexBlocks = [];
    const protectedRaw = raw.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
      const key = `__LATEX_${latexBlocks.length}__`;
      latexBlocks.push(m);
      return key;
    });

    // Extract JSON reliably
    const jsonMatch = protectedRaw.match(/FLASHCARDS_JSON[:\s]*({[\s\S]*})/);
    let flashJsonText = jsonMatch ? jsonMatch[1] : null;

    let notesText = flashJsonText
      ? protectedRaw.replace(jsonMatch[0], "").trim()
      : protectedRaw;

    // Parse JSON
    let parsed = { flashcards: [], tables: [], charts: [] };
    if (flashJsonText) {
      try {
        parsed = JSON.parse(flashJsonText);
      } catch (e) {
        try {
          parsed = JSON.parse(
            flashJsonText.replace(/```json/g, "").replace(/```/g, "")
          );
        } catch {}
      }
    }

    // Trim to allowed flashcard count
    const finalFlashcards = (parsed.flashcards || [])
      .slice(0, safeFlashCount)
      .map((f) => ({
        front: (f.front || f.question || "").trim(),
        back: (f.back || f.answer || "").trim(),
      }));

    const finalTables = parsed.tables || [];
    const finalCharts = parsed.charts || [];

    // Restore LaTeX
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
