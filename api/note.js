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
    const {
      topic,
      format = "bullet",
      length = "medium",
      flashCount = 8,
      additionalInfo = "",
      includeStructured = true, // optional: ask for tables/charts metadata
      customFormat // optional: alias for custom format text
    } = req.body || {};

    if (!topic) {
      return res.status(400).json({ error: "Missing topic" });
    }

    // sanitize flashCount
    const safeFlashCount = Math.max(4, Math.min(16, Number(flashCount || 8)));

    // build length hint
    let lengthHint = "Keep notes concise but informative (approx. ~250-400 words).";
    if (length === "short") lengthHint = "Keep the notes short and concise (approx. ~100-200 words).";
    if (length === "long") lengthHint = "Provide more thorough notes (approx. ~500-800 words).";

    // format label
    const formatLabel = format === "Custom" || format === "custom" ? (customFormat || "Custom") : format;

    // system + user messages (improved prompt design)
    const systemMessage = {
      role: "system",
      content:
        "You are an expert study assistant that writes clear, readable study notes. " +
        "Prefer study-friendly formatting: short headings, bullet lists, short descriptive paragraphs, and explicit 'Key points' and 'Examples' sections. " +
        "Preserve LaTeX math when present by wrapping equations with $$...$$. DO NOT include HTML tags. Return clean plain text for notes, and produce separate JSON outputs when requested. Be concise and pedagogical."
    };

    const userMessage = {
      role: "user",
      content:
        // Request both useful plain notes + structured metadata & flashcards
        `Create ${formatLabel} style study notes for this topic. ${lengthHint}
Notes should be clear and organized with headings, bullets, and short examples where helpful. Use LaTeX (wrap equations in $$...$$) if needed. Avoid HTML. Output a concise one-paragraph summary followed by the full notes.

Also: if the content naturally contains tabular data or small example tables, include a structured "tables" array in JSON (headers + rows). If there are charts suggested (e.g., comparisons, trends), include a "charts" array with minimal metadata (type, labels, values) so the frontend can render small visualizations.

Finally, produce STRICT JSON (no extra text) for flashcards after the notes. Flashcards must be an array of objects with keys: { front, back }.

Return two pieces:
1) The study notes (plain text, Markdown-friendly). 
2) A JSON block labeled "FLASHCARDS_JSON" containing the flashcards object.

Additional info (if any): ${additionalInfo || "none"}

Topic:
${topic}

Rules:
- The notes text should NOT be wrapped in markdown code fences.
- Protect any $$...$$ blocks (return them unchanged).
- For flashcards, return between 4 and ${safeFlashCount} cards.
- Example desired flashcard JSON shape:
  { "flashcards": [ { "front": "Q?", "back": "A" } ] }`
    };

    // Call OpenAI chat completion
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [systemMessage, userMessage],
        temperature: 0.45,
        max_tokens: 1400,
        n: 1,
      }),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // We expect the assistant to return notes text followed by a JSON flashcards block.
    // Strategy:
    // 1) Preserve $$...$$ blocks by temporarily protecting them (we will not try to modify them).
    // 2) Try to split the response into the notes part and the flashcards JSON part (look for "FLASHCARDS_JSON" or a JSON object).
    // 3) Clean HTML if any present (but prompt asks to not include HTML).
    // 4) Return: result (plain notes), flashcards (array), structured (optional arrays: tables, charts), summary.

    // Protect LaTeX blocks
    const latexPlaceholders = [];
    let protectedRaw = raw.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
      const key = `__LATEX_PLACEHOLDER_${latexPlaceholders.length}__`;
      latexPlaceholders.push(m);
      return key;
    });

    // Attempt to locate FLASHCARDS_JSON marker first
    let notesText = protectedRaw;
    let flashJsonText = null;

    const markerMatch = protectedRaw.match(/FLASHCARDS_JSON[:\s]*({[\s\S]*})/m);
    if (markerMatch && markerMatch[1]) {
      flashJsonText = markerMatch[1];
      notesText = protectedRaw.replace(markerMatch[0], "").trim();
    } else {
      // fallback: try to find the last JSON object in the string (first '{' ... last '}')
      const firstBrace = protectedRaw.indexOf("{");
      const lastBrace = protectedRaw.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // but ensure this is likely the flashcards JSON by simple heuristics ("flashcard" or "flashcards" inside)
        const possible = protectedRaw.slice(firstBrace, lastBrace + 1);
        if (/flashcards?/i.test(possible)) {
          flashJsonText = possible;
          notesText = (protectedRaw.slice(0, firstBrace) + protectedRaw.slice(lastBrace + 1)).trim();
        }
      }
    }

    // If we still don't have flashJsonText, try to extract ANY JSON-looking block at end
    if (!flashJsonText) {
      const matchEndJson = protectedRaw.match(/({[\s\S]*})\s*$/m);
      if (matchEndJson) {
        flashJsonText = matchEndJson[1];
        notesText = protectedRaw.replace(matchEndJson[0], "").trim();
      }
    }

    // If flashJsonText present, try to parse it; otherwise create fallback empty flashcards.
    let parsedFlash = { flashcards: [] };
    if (flashJsonText) {
      // remove code fences inside JSON if any
      let candidate = flashJsonText.replace(/```(json)?/g, "").trim();
      // attempt to get first {...} to last }
      const fb = candidate.indexOf("{");
      const lb = candidate.lastIndexOf("}");
      if (fb !== -1 && lb !== -1) candidate = candidate.slice(fb, lb + 1);
      try {
        parsedFlash = JSON.parse(candidate);
      } catch (err) {
        // attempt a relaxed parse: try to find array of flashcards inside text
        const arrMatch = candidate.match(/\[\s*{[\s\S]*}\s*\]/m);
        if (arrMatch) {
          try {
            parsedFlash = { flashcards: JSON.parse(arrMatch[0]) };
          } catch (e2) {
            parsedFlash = { flashcards: [] };
          }
        } else {
          parsedFlash = { flashcards: [] };
        }
      }
    }

    // restore LaTeX placeholders in notesText
    let plainNotes = notesText || "";
    latexPlaceholders.forEach((block, i) => {
      plainNotes = plainNotes.replace(`__LATEX_PLACEHOLDER_${i}__`, block);
    });

    // final cleanup: strip any stray HTML tags (but keep $$...$$)
    // remove tags except preserve LaTeX placeholders (they're restored already)
    plainNotes = plainNotes.replace(/<\/?[^>]+(>|$)/g, "").trim();

    // ensure parsedFlash.flashcards is valid array and sanitize strings
    const finalFlashcards = (parsedFlash.flashcards || [])
      .slice(0, safeFlashCount)
      .map((f) => ({
        front: (f.front || f.question || "").toString().trim(),
        back: (f.back || f.answer || "").toString().trim(),
      }));

    // Also create a short summary: try to extract from the start of the notes (first paragraph)
    const summaryMatch = plainNotes.split("\n\n")[0] || "";
    const summary = summaryMatch.length > 0 ? summaryMatch : `Notes on ${topic}`;

    // Provide limited structured output hints: we try to ask model to include tables/charts metadata,
    // but if it didn't, we return empty arrays.
    // Try to extract "tables" and "charts" blocks if the assistant provided JSON with those keys near flashcards JSON.
    const structured = { tables: [], charts: [] };

    // Try to find a "tables" or "charts" key in flashJsonText or in raw
    const structuredSource = flashJsonText || raw;
    try {
      const tmatch = structuredSource.match(/"tables"\s*:\s*(\[[\s\S]*?\])/m) || structuredSource.match(/tables\s*:\s*(\[[\s\S]*?\])/m);
      if (tmatch && tmatch[1]) {
        try {
          structured.tables = JSON.parse(tmatch[1]);
        } catch (e) {
          // ignore parse error
        }
      }
      const cmatch = structuredSource.match(/"charts"\s*:\s*(\[[\s\S]*?\])/m) || structuredSource.match(/charts\s*:\s*(\[[\s\S]*?\])/m);
      if (cmatch && cmatch[1]) {
        try {
          structured.charts = JSON.parse(cmatch[1]);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }

    return res.status(200).json({
      result: plainNotes,
      summary,
      flashcards: finalFlashcards,
      structured,
      raw: undefined, // intentionally not including raw by default to save payload; remove if you want debugging
    });
  } catch (err) {
    console.error("Note API error:", err);
    return res.status(500).json({ error: "Failed to generate notes" });
  }
}
