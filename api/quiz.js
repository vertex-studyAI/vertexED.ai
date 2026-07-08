import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from './_lib/auth.js';

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
  } = body ?? {};

  if (!notes || !String(notes).trim()) {
    return res.status(400).json({ error: "Missing notes" });
  }

  const optionCount = Math.max(2, Math.min(5, Number(mcqOptionCount) || 4));
  const counts = questionCounts(frqLength);

  const prompt = `Generate a quiz from the study notes below.

Quiz style: ${quizType}
Difficulty: ${difficulty}
Exam style: ${examStyle}
FRQ length preference: ${frqLength}

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

async function handleGrade(body, apiKey, res) {
  const {
    questions = [],
    userAnswers = {},
    gradingLeniency = 3,
    examStyle = "Generic",
  } = body ?? {};

  const toGrade = (Array.isArray(questions) ? questions : []).filter(
    (q) => q?.type === "frq" || q?.type === "interactive",
  );

  if (!toGrade.length) {
    return res.status(200).json({ grades: [] });
  }

  const prompt = `Grade the student's free-response answers using the rubric below.
Exam style: ${examStyle}
Leniency (1=strict, 5=lenient): ${gradingLeniency}

For each question return:
- id (matching input)
- score (number)
- maxScore (number)
- feedback (short string)
- includes (what the answer covered)

Return ONLY JSON: { "grades": [ { "id": "...", "score": 0, "maxScore": 5, "feedback": "...", "includes": "..." } ] }

QUESTIONS AND ANSWERS:
${JSON.stringify(
  toGrade.map((q) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt || q.question,
    modelAnswer: q.answer ?? q.expected ?? "",
    maxScore: q.maxScore ?? 5,
    studentAnswer: userAnswers[q.id] ?? "",
  })),
  null,
  2,
)}`;

  try {
    const raw = await callOpenAI(apiKey, [{ role: "user", content: prompt }], 2000);
    const parsed = extractJson(raw);
    const grades = Array.isArray(parsed?.grades) ? parsed.grades : [];
    return res.status(200).json({ grades });
  } catch (err) {
    console.error("Quiz grade error:", err);
    return res.status(500).json({ error: err.message || "Quiz grading failed" });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res)) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: "AI not configured" });
  }

  const body = parseJsonBody(req);
  const action = body?.action;

  if (action === "generate") {
    return handleGenerate(body, apiKey, res);
  }
  if (action === "grade") {
    return handleGrade(body, apiKey, res);
  }

  return res.status(400).json({ error: 'Invalid action. Use "generate" or "grade".' });
}
