// api/note.js

import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import {
  buildDeterministicFlashcards,
  buildDeterministicNoteFallback,
  buildGenerationMetadata,
} from '../_lib/learningArtifactFallbacks.js';

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
    return {
      raw: await callNotesResponsesApi(apiKey, systemMessage, userMessage, PRIMARY_NOTE_MODEL),
      model: PRIMARY_NOTE_MODEL,
    };
  } catch (primaryErr) {
    console.warn('Primary note model failed; retrying configured fallback.');
    try {
      return {
        raw: await callNotesResponsesApi(apiKey, systemMessage, userMessage, FALLBACK_NOTE_MODEL),
        model: FALLBACK_NOTE_MODEL,
      };
    } catch {
      return {
        raw: await callNotesChatFallback(apiKey, systemMessage, userMessage),
        model: FALLBACK_NOTE_MODEL,
      };
    }
  }
}

function fallbackNoteResponse({ topic, additionalInfo, flashCount, board, subjects }, failureClass) {
  const fallback = buildDeterministicNoteFallback({ topic, additionalInfo, flashCount });
  const source = JSON.stringify({ topic, additionalInfo, board, subjects });
  return {
    ...fallback,
    provenance: { topic, board: board || null, subjects: Array.isArray(subjects) ? subjects : [] },
    generation: buildGenerationMetadata({
      capability: 'note',
      mode: 'deterministic-fallback',
      source,
      failureClass,
    }),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'note', res))) return;

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
      board,
      subjects,
    } = body;

    const OPENAI_API_KEY =
      process.env.ChatbotKey || process.env.OPENAI_API_KEY || process.env.CHATBOT_KEY;

    if (mode === "flashcards" && source === "notes" && text?.trim()) {
      const safeFlashCount = Math.max(4, Math.min(16, Number(flashCount || 8)));
      const deterministicFlashcards = () => ({
        flashcards: buildDeterministicFlashcards(text, safeFlashCount),
        provenance: { topic: topic || null, board: board || null, subjects: Array.isArray(subjects) ? subjects : [] },
        generation: buildGenerationMetadata({
          capability: 'flashcards',
          mode: 'deterministic-fallback',
          source: text,
          failureClass: OPENAI_API_KEY ? 'provider_failure' : 'provider_unconfigured',
        }),
      });
      if (!OPENAI_API_KEY) return res.status(200).json(deterministicFlashcards());
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

      if (!flashResponse.ok) return res.status(200).json(deterministicFlashcards());

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

      if (!finalFlashcards.length) return res.status(200).json(deterministicFlashcards());
      return res.status(200).json({
        flashcards: finalFlashcards,
        provenance: { topic: topic || null, board: board || null, subjects: Array.isArray(subjects) ? subjects : [] },
        generation: buildGenerationMetadata({
          capability: 'flashcards',
          mode: 'model',
          model: 'gpt-4o-mini',
          source: text,
        }),
      });
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

    if (!OPENAI_API_KEY) {
      return res.status(200).json(fallbackNoteResponse({
        topic: noteTopic,
        additionalInfo: noteAdditionalInfo,
        flashCount: safeFlashCount,
        board,
        subjects,
      }, 'provider_unconfigured'));
    }

    // ---- OpenAI Responses API (with fallback) ----
    const generated = await generateNotesRaw(OPENAI_API_KEY, systemMessage, userMessage);
    const raw = generated.raw;
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
    const modelFlashcards = (Array.isArray(parsed.flashcards) ? parsed.flashcards : [])
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

    const partialModelOutput = modelFlashcards.length === 0;
    const finalFlashcards = partialModelOutput
      ? buildDeterministicFlashcards(notesText, safeFlashCount)
      : modelFlashcards;

    return res.status(200).json({
      result: notesText.trim(),
      summary,
      flashcards: finalFlashcards,
      structured: {
        tables: Array.isArray(parsed.tables) ? parsed.tables : [],
        charts: Array.isArray(parsed.charts) ? parsed.charts : [],
      },
      provenance: { topic: noteTopic, board: board || null, subjects: Array.isArray(subjects) ? subjects : [] },
      generation: buildGenerationMetadata({
        capability: 'note',
        mode: partialModelOutput ? 'model-partial-fallback' : 'model',
        model: generated.model,
        source: JSON.stringify({ topic: noteTopic, additionalInfo: noteAdditionalInfo, board, subjects }),
        failureClass: partialModelOutput ? 'malformed_model_output' : null,
      }),
    });

  } catch (err) {
    console.error("Note API generation failed; returning deterministic scaffold.");
    const body = readJsonBody(req);
    if (body?.mode === 'flashcards' && body?.source === 'notes' && body?.text?.trim()) {
      return res.status(200).json({
        flashcards: buildDeterministicFlashcards(body.text, body.flashCount),
        provenance: {
          topic: body.topic || null,
          board: body.board || null,
          subjects: Array.isArray(body.subjects) ? body.subjects : [],
        },
        generation: buildGenerationMetadata({
          capability: 'flashcards',
          mode: 'deterministic-fallback',
          source: body.text,
          failureClass: err?.name === 'AbortError' ? 'provider_timeout' : 'provider_failure',
        }),
      });
    }
    const topic = body?.topic;
    if (!topic) return res.status(400).json({ error: 'Missing topic' });
    return res.status(200).json(fallbackNoteResponse({
      topic,
      additionalInfo: body?.additionalInfo,
      flashCount: body?.flashCount,
      board: body?.board,
      subjects: body?.subjects,
    }, err?.name === 'AbortError' ? 'provider_timeout' : 'provider_failure'));
  }
}
