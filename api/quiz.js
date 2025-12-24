// /api/quiz.js
import fetch from "node-fetch";

const OPENAI_URL = "https://api.openai.com/v1/responses";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const API_KEY = process.env.ChatbotKey;
  if (!API_KEY) {
    return res.status(500).json({ error: "OpenAI key not set" });
  }

  const { action = "generate" } = req.body;

  try {
    if (action === "generate") {
      return await generateQuiz(req, res, API_KEY);
    }

    if (action === "grade") {
      return await gradeQuiz(req, res, API_KEY);
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("Quiz API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* ---------------- GENERATE ---------------- */

async function generateQuiz(req, res, API_KEY) {
  const {
    notes,
    difficulty = "Medium",
    examStyle = "Generic",
    desiredCount = 6,
  } = req.body;

  if (!notes) {
    return res.status(400).json({ error: "Missing notes" });
  }

  const prompt = `
Create a quiz from the notes.

Rules:
- Mix MCQ and FRQ
- Difficulty: ${difficulty}
- Exam style: ${examStyle}
- ${desiredCount} questions max
- MCQs must use option IDs (A–D)

Notes:
${notes}
`;

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "quiz",
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    type: { enum: ["multiple_choice", "frq"] },
                    question: { type: "string" },

                    options: {
                      type: "object",
                      properties: {
                        A: { type: "string" },
                        B: { type: "string" },
                        C: { type: "string" },
                        D: { type: "string" },
                      },
                      required: ["A", "B", "C", "D"],
                    },

                    correctOption: { enum: ["A", "B", "C", "D"] },

                    expected: { type: "string" },
                    rubric: { type: "string" },
                    maxScore: { type: "number" },
                  },
                  required: ["id", "type", "question", "maxScore"],
                },
              },
            },
            required: ["questions"],
          },
        },
      },
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  const quiz = data.output_parsed;

  return res.status(200).json(quiz);
}

/* ---------------- GRADE ---------------- */

async function gradeQuiz(req, res, API_KEY) {
  const { questions, userAnswers } = req.body;

  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: "Invalid questions" });
  }

  const grades = [];

  // 1️⃣ Deterministic MCQ grading
  for (const q of questions) {
    if (q.type === "multiple_choice") {
      const user = userAnswers?.[q.id];
      const correct = user === q.correctOption;

      grades.push({
        id: q.id,
        score: correct ? q.maxScore : 0,
        maxScore: q.maxScore,
        feedback: correct ? "Correct." : `Correct answer: ${q.correctOption}`,
      });
    }
  }

  // 2️⃣ Send only FRQs to model
  const frqs = questions.filter(q => q.type === "frq");
  if (!frqs.length) {
    return res.status(200).json({ grades });
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: `
Grade these FRQs using the rubric.
Return strict JSON.

Questions:
${JSON.stringify(frqs, null, 2)}

Student answers:
${JSON.stringify(userAnswers, null, 2)}
`,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "grades",
          schema: {
            type: "object",
            properties: {
              grades: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    score: { type: "number" },
                    maxScore: { type: "number" },
                    feedback: { type: "string" },
                  },
                  required: ["id", "score", "maxScore", "feedback"],
                },
              },
            },
            required: ["grades"],
          },
        },
      },
      temperature: 0,
    }),
  });

  const data = await response.json();
  grades.push(...data.output_parsed.grades);

  return res.status(200).json({ grades });
}
