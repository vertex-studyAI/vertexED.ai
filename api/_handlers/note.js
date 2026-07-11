// api/note.js

import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';

const PRIMARY_NOTE_MODEL = process.env.NOTE_MODEL || 'ft:gpt-4o-mini-2024-07-18:verteded:notes:CRuakY3O';
const FALLBACK_NOTE_MODEL = process.env.NOTE_FALLBACK_MODEL || 'gpt-4o-mini';

async function extractResponsesText(response) {
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${errText}`);
  }
  const data = await response.json();
  let raw = '';
  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.content) {
        for (const block of item.content) {
          if (block.type === 'output_text' && block.text) {
            raw += block.text;
          }
        }
      }
    }
  }
  if (!raw.trim()) throw new Error('Empty model output');
  return raw;
}

async function callNotesResponsesApi(apiKey, systemMessage, userMessage, model) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [systemMessage, userMessage],
      temperature: 0.45,
      max_output_tokens: 1600,
    }),
  });
  return extractResponsesText(response);
}

async function callNotesChatFallback(apiKey, systemMessage, userMessage) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: FALLBACK_NOTE_MODEL,
      messages: [systemMessage, userMessage],
      temperature: 0.45,
      max_tokens: 1600,
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI fallback error: ${errText}`);
  }
  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? '';
  if (!raw.trim()) throw new Error('Empty fallback model output');
  return raw;
}

async function generateNotesRaw(apiKey, systemMessage, userMessage) {
  try {
    return await callNotesResponsesApi(apiKey, systemMessage, userMessage, PRIMARY_NOTE_MODEL);
  } catch (primaryErr) {
    console.warn('Primary note model failed, retrying fallback:', primaryErr?.message || primaryErr);
    try {
      return await callNotesResponsesApi(apiKey, systemMessage, userMessage, FALLBACK_NOTE_MODEL);
    } catch {
      return callNotesChatFallback(apiKey, systemMessage, userMessage);
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'note', res))) return;

  const OPENAI_API_KEY =
    process.env.ChatbotKey || process.env.OPENAI_API_KEY || process.env.CHATBOT_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "AI not set" });
  }

  try {
    const body = readJsonBody(req);
    const {
      topic,
      format = "bullet",
      length = "medium",
      flashCount = 8,
      additionalInfo = "",
      customFormat,
      mode,
      source,
      text,
    } = body;

    if (mode === "flashcards" && source === "notes" && text?.trim()) {
      const safeFlashCount = Math.max(4, Math.min(16, Number(flashCount || 8)));
      const flashPrompt = `Create ${safeFlashCount} study flashcards from the notes below.
Return ONLY JSON: { "flashcards": [ { "front": "...", "back": "..." } ] }

NOTES:
${String(text).slice(0, 10000)}`;

      const flashResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: flashPrompt }],
          temperature: 0.35,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        }),
      });

      if (!flashResponse.ok) {
        const errText = await flashResponse.text();
        throw new Error(`OpenAI error: ${errText}`);
      }

      const flashData = await flashResponse.json();
      const rawFlash = flashData.choices?.[0]?.message?.content ?? "{}";
      let parsedFlash = { flashcards: [] };
      try {
        parsedFlash = JSON.parse(rawFlash);
      } catch {
        const start = rawFlash.indexOf("{");
        const end = rawFlash.lastIndexOf("}") + 1;
        if (start >= 0 && end > start) parsedFlash = JSON.parse(rawFlash.slice(start, end));
      }

      const finalFlashcards = (parsedFlash.flashcards || [])
        .slice(0, safeFlashCount)
        .map((f) => ({
          front: (f.front || f.question || "").trim(),
          back: (f.back || f.answer || "").trim(),
        }))
        .filter((f) => f.front && f.back);

      return res.status(200).json({ flashcards: finalFlashcards });
    }

    const {
      topic: noteTopic = topic,
      format: noteFormat = format,
      length: noteLength = length,
      flashCount: noteFlashCount = flashCount,
      additionalInfo: noteAdditionalInfo = additionalInfo,
      customFormat: noteCustomFormat = customFormat,
    } = body;

    if (!noteTopic) {
      return res.status(400).json({ error: "Missing topic" });
    }

    const safeFlashCount = Math.max(4, Math.min(16, Number(noteFlashCount || 8)));

    let lengthHint = "Keep notes concise but informative (~250–400 words).";
    if (noteLength === "short") lengthHint = "Keep notes short (~100–200 words).";
    if (noteLength === "long") lengthHint = "Provide detailed notes (~500–800 words).";

    const formatLabel =
      String(noteFormat).toLowerCase() === "custom" ? noteCustomFormat || "Custom" : noteFormat;

    const systemMessage = {
      role: "system",
      content:
        "You are an expert study assistant. " +
        "Produce study notes with clear structure: short headings, bullet lists, examples. " +
        "Preserve LaTeX $$...$$. " +
        "Return exactly two blocks:\n\n" +
        "1) NOTES (Markdown)\n" +
        "2) FLASHCARDS_JSON: { flashcards: [], tables: [], charts: [] }",
    };

    const userMessage = {
      role: "user",
      content: `Create ${formatLabel} style study notes. ${lengthHint}
Include headings, bullets, LaTeX, tables, and at the end output:

FLASHCARDS_JSON:
{ "flashcards": [...], "tables": [...], "charts": [...] }

Topic: ${noteTopic}
Extra info: ${noteAdditionalInfo || "none"}
Flashcards: 4–${safeFlashCount}`,
    };

    // ---- OpenAI Responses API (with fallback) ----
    const raw = await generateNotesRaw(OPENAI_API_KEY, systemMessage, userMessage);
    // ---- Protect LaTeX ----
    const latexBlocks = [];
    let protectedRaw = raw.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
      const key = `__LATEX_${latexBlocks.length}__`;
      latexBlocks.push(m);
      return key;
    });

    // ---- Extract JSON ----
    const jsonMatch = protectedRaw.match(
      /FLASHCARDS_JSON\s*:?\s*({[\s\S]*})/i
    );

    let flashJsonText = jsonMatch?.[1] || null;

    let notesText = flashJsonText
      ? protectedRaw.replace(jsonMatch[0], "").trim()
      : protectedRaw;

    let parsed = { flashcards: [], tables: [], charts: [] };
    if (flashJsonText) {
      try {
        parsed = JSON.parse(flashJsonText);
      } catch {
        try {
          parsed = JSON.parse(
            flashJsonText.replace(/```json|```/g, "")
          );
        } catch {}
      }
    }

    // ---- Normalize flashcards ----
    const finalFlashcards = (parsed.flashcards || [])
      .slice(0, safeFlashCount)
      .map((f) => ({
        front: (f.front || f.question || "").trim(),
        back: (f.back || f.answer || "").trim(),
      }))
      .filter((f) => f.front && f.back);

    // ---- Restore LaTeX ----
    latexBlocks.forEach((block, i) => {
      notesText = notesText.replace(`__LATEX_${i}__`, block);
    });

    const summary =
      notesText.split("\n").find((l) => l.trim()) || `Notes on ${noteTopic}`;

    return res.status(200).json({
      result: notesText.trim(),
      summary,
      flashcards: finalFlashcards,
      structured: {
        tables: parsed.tables || [],
        charts: parsed.charts || [],
      },
    });

  } catch (err) {
    console.error("Note API error:", err);
    return res.status(500).json({
      error: "Failed to generate notes",
      details: err.message,
    });
  }
}
