export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";

// ---- ENV SAFETY ----
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      mode = "notes",          // "notes" | "flashcards"
      source = "topic",        // "topic" | "notes" | "audio"
      topic,
      text,
      flashCount = 6,
      length = "medium",
    } = body ?? {};

    let prompt = "";

    // ---------- MODE: NOTES ----------
    if (mode === "notes") {
      if (source === "topic") {
        if (!topic?.trim()) {
          return NextResponse.json(
            { error: "Missing topic" },
            { status: 400 }
          );
        }

        prompt = `
Create clear, student-friendly study notes on the topic below.

Topic:
"${topic}"

Guidelines:
- Length: ${length}
- Natural explanation style
- Minimal bullets
- Clear reasoning
        `;
      }

      if (source === "audio") {
        if (!text?.trim()) {
          return NextResponse.json(
            { error: "Missing transcription text" },
            { status: 400 }
          );
        }

        prompt = `
Convert the following transcription into clean study notes.
Make them clear, structured, and concise.

Transcription:
${text}
        `;
      }
    }

    // ---------- MODE: FLASHCARDS ----------
    if (mode === "flashcards") {
      if (!text?.trim()) {
        return NextResponse.json(
          { error: "Missing source notes" },
          { status: 400 }
        );
      }

      prompt = `
Generate ${flashCount} flashcards from the notes below.

Rules:
- JSON ONLY
- No markdown
- No explanations
- Each item must have "question" and "answer"

Notes:
${text}

Return EXACTLY:
{
  "flashcards": [
    { "question": "...", "answer": "..." }
  ]
}
      `;
    }

    // ---------- SAFETY GUARD ----------
    if (!prompt.trim()) {
      return NextResponse.json(
        { error: "Invalid mode/source combination" },
        { status: 400 }
      );
    }

    // ---------- OPENAI CALL ----------
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 900,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";

    if (!raw.trim()) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 500 }
      );
    }

    // ---------- FLASHCARD PARSING ----------
    if (mode === "flashcards") {
      try {
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}") + 1;
        const clean = raw.slice(start, end);
        const parsed = JSON.parse(clean);

        return NextResponse.json({
          flashcards: parsed.flashcards ?? [],
        });
      } catch (err) {
        console.error("Flashcard parse error:", raw);
        return NextResponse.json(
          { error: "Failed to parse flashcards" },
          { status: 500 }
        );
      }
    }

    // ---------- NOTES RESPONSE ----------
    return NextResponse.json({
      notes: raw.trim(),
    });

  } catch (err) {
    console.error("API /api/note crash:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
