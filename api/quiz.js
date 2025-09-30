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
    const { action = "generate" } = body;

    // ----------------- GENERATE MODE -----------------
    if (action === "generate") {
      const { notes, quizType = "Multiple Choice", difficulty = "Medium", frqLength = "medium" } = body;
      if (!notes) {
        return res.status(400).json({ error: "Missing notes" });
      }

      const difficultyHint =
        difficulty === "Easy"
          ? "Make questions straightforward and basic."
          : difficulty === "Hard"
          ? "Include challenging, synthesis/analysis-style questions."
          : "Include a mix of conceptual and application questions at moderate difficulty.";

      const frqHint =
        frqLength === "short"
          ? "FRQs: 1-3 sentences."
          : frqLength === "long"
          ? "FRQs: 3-6 sentences."
          : "FRQs: 2-4 sentences.";

      const prompt = `Create a ${quizType} quiz from the notes below.
${difficultyHint} ${frqHint}

Notes:
${notes}

Return STRICT JSON in this shape:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "interactive" | "frq",
      "question": "string",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "answer": "correct option text",
      "explanations": ["explain opt1", "explain opt2", ...],
      "expected": "expected short answer (for FRQ/interactive)",
      "maxScore": 2,
      "rubric": "short grading rubric",
      "inclusions": "what must be included in a correct answer"
    }
  ]
}`;

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
      let raw = data.choices?.[0]?.message?.content || "";

      if (raw.startsWith("```")) {
        raw = raw.replace(/```(json)?/g, "").trim();
      }
      const firstBrace = raw.indexOf("{");
      const lastBrace = raw.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        raw = raw.slice(firstBrace, lastBrace + 1);
      }

      let parsed = { questions: [] };
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        console.error("Quiz JSON parse error:", err, raw);
        return res.status(500).json({ error: "Could not parse quiz output" });
      }

      // Normalize question shape
      const questions = (parsed.questions || []).map((q, idx) => {
        const out = {
          id: q.id ?? idx + 1,
          type: q.type || "multiple_choice",
          question: q.question || "",
        };

        if (out.type === "multiple_choice") {
          const opts = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["A", "B", "C", "D"];
          const shuffled = opts
            .map((o) => ({ o, r: Math.random() }))
            .sort((a, b) => a.r - b.r)
            .map((x) => x.o);
          out.options = shuffled;
          out.answer = q.answer || shuffled[0];
          out.explanations = Array.isArray(q.explanations) ? q.explanations : [];
        } else if (out.type === "frq") {
          out.expected = q.expected || "";
          out.maxScore = typeof q.maxScore === "number" ? q.maxScore : 2;
          out.rubric = q.rubric || "Grade on completeness and correctness (0-2).";
          out.inclusions = q.inclusions || "";
        } else {
          out.answer = q.answer || "";
        }

        return out;
      });

      return res.status(200).json({ questions });
    }

    // ----------------- GRADE MODE -----------------
    if (action === "grade") {
      const { questions, userAnswers } = body;
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: "Missing questions" });
      }

      const gradingPrompt = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an objective grader. For each FRQ/interactive, assign a score (0-2), one-sentence feedback, and list missing inclusions. For MCQ: score 2 if correct, else 0, with brief explanation. Return STRICT JSON only.",
          },
          {
            role: "user",
            content: `Grade student answers.

Questions:
${JSON.stringify(questions, null, 2)}

Answers:
${JSON.stringify(userAnswers, null, 2)}

Return shape:
{
  "grades": [
    { "id": 1, "score": 0|1|2, "maxScore": 2, "feedback": "short feedback", "includes": "what was missing/expected" }
  ]
}`,
          },
        ],
        temperature: 0,
      };

      const gradeRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(gradingPrompt),
      });

      const gradeData = await gradeRes.json();
      let raw = gradeData.choices?.[0]?.message?.content || "";

      if (raw.startsWith("```")) {
        raw = raw.replace(/```(json)?/g, "").trim();
      }
      const firstBrace = raw.indexOf("{");
      const lastBrace = raw.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        raw = raw.slice(firstBrace, lastBrace + 1);
      }

      let parsed = { grades: [] };
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        console.error("Grading JSON parse error:", err, raw);
        return res.status(500).json({ error: "Could not parse grading output" });
      }

      return res.status(200).json({ grades: parsed.grades || [] });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("Quiz API error:", err);
    return res.status(500).json({ error: "Failed to handle quiz request" });
  }
}
