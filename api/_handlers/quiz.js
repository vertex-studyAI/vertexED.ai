import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';

function parseJsonBody(req) {
  let body = req.body ?? {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body;
}

function getApiKey() {
  return process.env.OPENAI_API_KEY || process.env.ChatbotKey || process.env.CHATBOT_KEY;
}

function extractJson(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}") + 1;
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(raw.slice(start, end));
    } catch {
      return null;
    }
  }
}

async function callOpenAI(apiKey, messages, maxTokens = 2500) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.35,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${err.slice(0, 500)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function questionCounts(frqLength) {
  if (frqLength === "medium") {
    return { mcq: 3, frq: 3, interactive: 0 };
  }
  if (frqLength === "long") {
    return { mcq: 5, frq: 1, interactive: 1 };
  }
  return { mcq: 4, frq: 2, interactive: 0 };
}

async function handleGenerate(body, apiKey, res) {
  const {
    notes,
    quizType = "Adaptive Learning",
    difficulty = "Medium",
    frqLength = "short",
    examStyle = "Generic",
    mcqOptionCount = 4,
    adaptiveTopics = [],
    board = null,
    subjects = [],
  } = body ?? {};

  if (!notes || !String(notes).trim()) {
    return res.status(400).json({ error: "Missing notes" });
  }

  const optionCount = Math.max(2, Math.min(5, Number(mcqOptionCount) || 4));
  const counts = questionCounts(frqLength);

  const adaptiveHint =
    quizType === "Adaptive Learning" && Array.isArray(adaptiveTopics) && adaptiveTopics.length
      ? `\nPrioritize these weak/high-yield topics: ${adaptiveTopics.join(", ")}.`
      : "";
  const boardHint = board
    ? `\nStudent board: ${board}. Subjects: ${(subjects || []).join(", ") || "general"}. Use board-appropriate command terms.`
    : "";

  const prompt = `Generate a quiz from the study notes below.

Quiz style: ${quizType}
Difficulty: ${difficulty}
Exam style: ${examStyle}
FRQ length preference: ${frqLength}${adaptiveHint}${boardHint}

Create exactly ${counts.mcq} multiple_choice questions, ${counts.frq} frq questions, and ${counts.interactive} interactive questions.
Each multiple_choice question must include exactly ${optionCount} choices in "choices".
Each question needs a unique string "id" (q1, q2, ...).
For multiple_choice, "answer" must exactly match one choice.
For frq and interactive, include "maxScore" between 2 and 10 and a model "answer" for grading reference.

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "prompt": "Question text",
      "choices": ["A", "B", "C", "D"],
      "answer": "A",
      "maxScore": 2
    }
  ]
}

NOTES:
${String(notes).slice(0, 12000)}`;

  try {
    const raw = await callOpenAI(apiKey, [{ role: "user", content: prompt }], 3000);
    const parsed = extractJson(raw);
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];

    if (!questions.length) {
      return res.status(500).json({ error: "Failed to parse quiz questions", raw: raw.slice(0, 1000) });
    }

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("Quiz generate error:", err);
    return res.status(500).json({ error: err.message || "Quiz generation failed" });
  }
}

async function handleGrade(body, res) {
  const {
    questions = [],
    userAnswers = {},
  } = body ?? {};

  const allQuestions = Array.isArray(questions) ? questions : [];
  const grades = allQuestions.map((q) => {
    if (q?.type === "multiple_choice" && Array.isArray(q?.choices)) {
      const expected = String(q.answer ?? "").trim();
      const actual = String(userAnswers[q.id] ?? "").trim();
      const maxScore = Number(q.maxScore ?? 1) || 1;
      const score = expected && actual === expected ? maxScore : 0;
      return {
        id: q.id,
        score,
        maxScore,
        feedback: score === maxScore ? "Deterministically correct." : "Deterministically incorrect.",
        gradingStatus: "verified",
      };
    }

    return {
      id: q?.id ?? null,
      score: null,
      maxScore: Number(q?.maxScore ?? 0) || null,
      feedback:
        "Score withheld. VertexEd only auto-scores deterministically in this quiz flow; use feedback or human review for constructed responses.",
      gradingStatus: "withheld",
    };
  });

  return res.status(200).json({ grades });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!(await rateLimitUserEndpoint(user.id, 'quiz', res))) return;

  if (rejectOversizedJsonBody(req, res)) return;

  const body = parseJsonBody(req);
  const action = body?.action;

  if (action === "generate") {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({ error: "AI generation is not configured" });
    }
    return handleGenerate(body, apiKey, res);
  }
  if (action === "grade") {
    return handleGrade(body, res);
  }

  return res.status(400).json({ error: 'Invalid action. Use "generate" or "grade".' });
}
