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
    const action = body.action || "generate";

    // ----------------- GENERATE MODE -----------------
    if (action === "generate") {
      const {
        notes,
        quizType = "Multiple Choice",
        difficulty = "Medium",
        frqLength = "medium",
        gradingLeniency = 3,
        examStyle = "Generic",
        desiredCount = 6,
      } = body;

      if (!notes) {
        return res.status(400).json({ error: "Missing notes" });
      }

      // Build hints
      const difficultyHint =
        difficulty === "Easy"
          ? "Make questions straightforward, focused on recall and simple understanding."
          : difficulty === "Hard"
          ? "Include challenging application and synthesis questions requiring multi-step reasoning."
          : "Include a mix of conceptual and application questions at moderate difficulty.";

      const frqHint =
        frqLength === "short"
          ? "FRQs should be short (1-3 sentences)."
          : frqLength === "long"
          ? "FRQs should be detailed (3-6 sentences)."
          : "FRQs should be medium (2-4 sentences).";

      // exam style hint (make rubrics and tone align with exam style)
      const examHint =
        examStyle && examStyle !== "Generic"
          ? `Write questions and rubrics that are representative of ${examStyle} style assessments (tone, clarity, and typical mark allocation).`
          : "Use a generic exam style suitable for high school/college.";

      // We want a strict JSON response for questions
      const prompt = `You are a precise quiz writer. ${difficultyHint} ${frqHint} ${examHint}
Produce a quiz based on the provided notes. Output STRICTLY valid JSON only, with this shape:

{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "interactive" | "frq",
      "question": "string",
      // multiple_choice fields:
      "options": ["A", "B", "C", "D"],
      "answer": "the exact correct option text",
      "explanations": ["explain option1", "explain option2", ...],
      // frq/interactive fields:
      "expected": "brief expected points or key bullets",
      "maxScore": 2,
      "rubric": "grading rubric - short",
      "inclusions": "what must be included for full credit"
    }
  ]
}

Requirements:
- Produce at least 3 questions and up to ${Math.max(3, Math.min(12, desiredCount))} (mix types).
- For MCQ provide 4 options, plausible distractors, and short explanation per option.
- For FRQ/interactive include a 0-2 (or 0-4 if you choose) rubric and a concise 'inclusions' field.
- Make the language clear and appropriate to ${examStyle}.
Notes:
${notes}
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
          temperature: 0.45,
          max_tokens: 1100,
        }),
      });

      const data = await response.json();
      let raw = data.choices?.[0]?.message?.content || "";

      // Strip code fences if present
      raw = raw.replace(/```(?:json)?/g, "").trim();

      // Extract first { ... } block
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
        // Try to be forgiving: attempt to extract an array of questions
        const arrMatch = raw.match(/\[\s*{[\s\S]*}\s*\]/m);
        if (arrMatch) {
          try {
            parsed = { questions: JSON.parse(arrMatch[0]) };
          } catch (e2) {
            parsed = { questions: [] };
          }
        } else {
          return res.status(500).json({ error: "Could not parse quiz JSON output" });
        }
      }

      // Normalize and post-process questions: ensure ids, options, answers, explanations, rubric
      const questions = (parsed.questions || []).map((q, idx) => {
        const out = {
          id: q.id ?? idx + 1,
          type: q.type ?? "multiple_choice",
          question: q.question ?? "",
        };

        if (out.type === "multiple_choice") {
          const opts = Array.isArray(q.options) && q.options.length >= 2 ? q.options.slice(0, 4) : ["A", "B", "C", "D"];
          // shuffle options but keep answer text string
          const original = opts.slice();
          const shuffled = opts
            .map((o) => ({ o, r: Math.random() }))
            .sort((a, b) => a.r - b.r)
            .map((x) => x.o);
          out.options = shuffled;
          out.answer = q.answer ?? original[0];
          // map explanations to shuffled options if explanations provided
          if (Array.isArray(q.explanations) && q.explanations.length === original.length) {
            out.explanations = shuffled.map((s) => {
              const i = original.indexOf(s);
              return i >= 0 ? q.explanations[i] : "";
            });
          } else {
            out.explanations = q.explanations ?? [];
          }
          out.maxScore = typeof q.maxScore === "number" ? q.maxScore : 2;
        } else if (out.type === "frq") {
          out.expected = q.expected ?? q.answer ?? "";
          out.maxScore = typeof q.maxScore === "number" ? q.maxScore : 2;
          out.rubric = q.rubric ?? "Grade on correctness and completeness (0-full).";
          out.inclusions = q.inclusions ?? "";
        } else {
          // interactive / short answer
          out.expected = q.expected ?? q.answer ?? "";
          out.maxScore = typeof q.maxScore === "number" ? q.maxScore : 2;
        }

        return out;
      });

      return res.status(200).json({ questions });
    }

    // ----------------- GRADE MODE -----------------
    if (action === "grade") {
      const { questions, userAnswers, gradingLeniency = 3, examStyle = "Generic" } = body;
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: "Missing questions to grade" });
      }

      // Build grading instructions that account for leniency and exam style
      const leniencyFactor = Math.max(1, Math.min(5, Number(gradingLeniency || 3)));
      const leniencyNote =
        leniencyFactor >= 4
          ? "Be generous with partial credit according to leniency."
          : leniencyFactor <= 2
          ? "Be strict with partial credit; require key points."
          : "Apply moderate leniency for partial credit.";

      const gradingSystemMsg = {
        role: "system",
        content:
          "You are an objective grading assistant. For each FRQ or interactive answer, assign an integer score between 0 and maxScore, provide a one-sentence feedback, and list what should have been included. For MCQ, award full points for exact match, zero otherwise, and include a one-sentence explanation. Return STRICT JSON only.",
      };

      const gradingUserMsg = {
        role: "user",
        content: `Grade these student answers using the rubrics and leniency instructions.

Leniency: ${leniencyNote}
Exam style: ${examStyle}

Questions (with rubric and expected/inclusions when available):
${JSON.stringify(questions, null, 2)}

Student answers:
${JSON.stringify(userAnswers, null, 2)}

Return JSON only with shape:
{ "grades": [ { "id": <id>, "score": <int>, "maxScore": <int>, "feedback": "one-sentence", "includes": "what should be included or missing" } ] }`
      };

      const gradePayload = {
        model: "gpt-3.5-turbo",
        messages: [gradingSystemMsg, gradingUserMsg],
        temperature: 0,
      };

      const gradeRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(gradePayload),
      });

      const gradeData = await gradeRes.json();
      let raw = gradeData.choices?.[0]?.message?.content || "";

      // cleanup
      raw = raw.replace(/```(?:json)?/g, "").trim();
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
        // fallback: return a simple automatic grading for MCQs and blank placeholders for FRQs
        const fallbackGrades = questions.map((q) => {
          if (q.type === "multiple_choice") {
            const user = userAnswers[q.id];
            const isCorrect = q.answer && user === q.answer;
            return {
              id: q.id,
              score: isCorrect ? (q.maxScore ?? 2) : 0,
              maxScore: q.maxScore ?? 2,
              feedback: isCorrect ? "Correct." : `Incorrect. Correct answer: ${q.answer}`,
              includes: q.inclusions || "",
            };
          } else {
            return {
              id: q.id,
              score: 0,
              maxScore: q.maxScore ?? 2,
              feedback: "Needs grading (no automated rubric available).",
              includes: q.inclusions || "",
            };
          }
        });
        return res.status(200).json({ grades: fallbackGrades });
      }

      // ensure each graded item has id, score, maxScore
      const grades = (parsed.grades || []).map((g) => ({
        id: g.id,
        score: typeof g.score === "number" ? g.score : Number(g.score) || 0,
        maxScore: typeof g.maxScore === "number" ? g.maxScore : g.maxScore ? Number(g.maxScore) : 2,
        feedback: g.feedback || "",
        includes: g.includes || "",
      }));

      return res.status(200).json({ grades });
    }

    // unknown action
    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("Quiz API error:", err);
    return res.status(500).json({ error: "Failed to handle quiz request" });
  }
}
