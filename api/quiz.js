// api/quiz.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not set" });
  }

  try {
    const body = req.body || {};
    const action = body.action || "generate"; // "generate" or "grade"

    // --------- GENERATE MODE ---------
    if (action === "generate") {
      const { notes, quizType } = body;
      if (!notes) return res.status(400).json({ error: "Missing notes" });

      // Ask the model to produce a strict JSON structure for questions.
      // For MCQ provide options and answer text; for FRQ include an expected answer & rubric.
      const prompt = `
Create a ${quizType || "Multiple Choice"} quiz based on the following notes.

Notes:
${notes}

Output STRICTLY valid JSON (no extra text) with this shape:

{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "interactive" | "frq",
      "question": "string",
      // For multiple_choice:
      "options": ["option text 1", "option text 2", "option text 3", "option text 4"],
      "answer": "the exact correct option text",
      // For frq:
      "expected": "brief expected answer or key points",
      "maxScore": 2,
      "rubric": "short rubric to grade from 0 to 2"
    }
  ]
}

Notes may contain LaTeX; keep expected/rubric concise (1-2 sentences).
Make sure the correct answer is the option text (not a letter). Provide at least 3 questions.
`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content;

      if (!raw) {
        console.error("OpenAI response invalid:", data);
        return res.status(500).json({ error: "Invalid response from OpenAI" });
      }

      // Try parse JSON — models sometimes embed JSON in markdown; try to extract
      let jsonStr = raw.trim();
      // remove markdown fences if present
      if (jsonStr.startsWith("```")) {
        const firstLineBreak = jsonStr.indexOf("\n");
        jsonStr = jsonStr.slice(firstLineBreak + 1);
        if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
      }

      let parsed = {};
      try {
        parsed = JSON.parse(jsonStr);
      } catch (err) {
        console.error("Failed to parse quiz JSON. Raw answer:", raw);
        return res.status(500).json({ error: "Could not parse quiz JSON output" });
      }

      // Post-process: ensure options exist for MCQ and shuffle options so correct answer isn't always "A"
      const questions = (parsed.questions || []).map((q, idx) => {
        const out = { id: q.id ?? idx + 1, type: q.type ?? "interactive", question: q.question ?? "" };

        if (q.type === "multiple_choice") {
          const opts = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["A", "B", "C", "D"];
          // shuffle while keeping track of correct option text
          const shuffled = opts
            .map((o) => ({ o, r: Math.random() }))
            .sort((a, b) => a.r - b.r)
            .map((x) => x.o);
          out.options = shuffled;
          out.answer = q.answer ?? opts[0];
        } else if (q.type === "frq") {
          out.expected = q.expected || q.answer || "";
          out.maxScore = typeof q.maxScore === "number" ? q.maxScore : 2;
          out.rubric = q.rubric || "Score 0-2 based on completeness and correctness.";
        } else {
          // interactive - short answer
          out.answer = q.answer || q.expected || "";
        }

        return out;
      });

      return res.status(200).json({ questions });
    }

    // --------- GRADE MODE ---------
    if (action === "grade") {
      // Expect: { action: "grade", questions: [...], userAnswers: { "<id>": "user text" } }
      const { questions, userAnswers } = body;
      if (!questions || !Array.isArray(questions)) return res.status(400).json({ error: "Missing questions to grade" });

      // Build a grading prompt: ask the model to grade each FRQ / interactive answer 0-2 with brief feedback.
      // We'll send the questions and user's answers and request a strict JSON return of scores and feedback.
      const gradingPayload = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an objective grader. For each question provided, return a score (integer 0-2) and a one-sentence feedback. Return STRICT JSON only."
          },
          {
            role: "user",
            content: `Grade these student answers.

Questions (with rubric/expected when available):
${JSON.stringify(questions, null, 2)}

Student answers:
${JSON.stringify(userAnswers, null, 2)}

For each question id, produce:
{
 "id": <id>,
 "score": 0|1|2,
 "maxScore": <maxScore>,
 "feedback": "one sentence feedback"
}

Return JSON: { "grades": [ ... ] }
Only grade questions of type "frq" or "interactive". For multiple_choice you may assign full (2) or zero/partial if the selected option matches the correct answer.`
          }
        ],
        temperature: 0,
      };

      const gradeRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(gradingPayload),
      });

      const gradeData = await gradeRes.json();
      const gradeRaw = gradeData.choices?.[0]?.message?.content || "";

      if (!gradeRaw) {
        console.error("OpenAI grading invalid:", gradeData);
        return res.status(500).json({ error: "Invalid grading response from OpenAI" });
      }

      let gradeJson = gradeRaw.trim();
      if (gradeJson.startsWith("```")) {
        const firstLineBreak = gradeJson.indexOf("\n");
        gradeJson = gradeJson.slice(firstLineBreak + 1);
        if (gradeJson.endsWith("```")) gradeJson = gradeJson.slice(0, -3);
      }

      let parsedGrades = {};
      try {
        parsedGrades = JSON.parse(gradeJson);
      } catch (err) {
        console.error("Failed to parse grading JSON. Raw:", gradeRaw);
        return res.status(500).json({ error: "Could not parse grading JSON output" });
      }

      // Return grades array (id, score, maxScore, feedback)
      return res.status(200).json({ grades: parsedGrades.grades || [] });
    }

    // unknown action
    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("Quiz API error:", err);
    return res.status(500).json({ error: "Failed to handle quiz request" });
  }
}
