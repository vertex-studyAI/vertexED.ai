import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
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
    } = body;

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
Create clear, student-friendly study notes on the topic:
"${topic}"

Length: ${length}
Avoid bullet overload.
Explain concepts naturally.
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
Convert the following transcription into structured study notes.
Make it concise but clear.

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
- Each flashcard must have a "question" and "answer"
- Keep answers short but precise
- No markdown, no extra text

Notes:
${text}

Return JSON ONLY in this format:
{
  "flashcards": [
    { "question": "...", "answer": "..." }
  ]
}
      `;
    }

    // ---------- LLM CALL ----------
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content ?? "";

    // ---------- FLASHCARD PARSING ----------
    if (mode === "flashcards") {
      try {
        const parsed = JSON.parse(raw);
        return NextResponse.json({
          flashcards: parsed.flashcards ?? [],
        });
      } catch {
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
    console.error("API /api/note error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
