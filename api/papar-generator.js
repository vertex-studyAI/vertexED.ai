// /api/paper-generator.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.ChatbotKey;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4";

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ success: false, error: "OpenAI API key not configured" });
    }

    const payload = req.body ?? {};
    const board = String(payload.board ?? "IB MYP");
    const grade = payload.grade ?? null;
    const subject = String(payload.subject ?? "");
    const topicsRaw = payload.topics ?? [];
    const topics = Array.isArray(topicsRaw) ? topicsRaw.map(String).map(t => t.trim()).filter(Boolean) : String(topicsRaw).split(",").map(t => t.trim()).filter(Boolean);
    const marks = typeof payload.marks === "number" ? payload.marks : null;
    const criteria = payload.criteria ?? null;
    const numQuestions = Number(payload.numQuestions ?? 10);
    const format = payload.format ?? "Mixed Format";
    const difficulty = payload.difficulty ?? "Medium";
    const anythingElse = String(payload.anythingElse ?? "");
    const priorPapers = Array.isArray(payload.priorPapers) ? payload.priorPapers.slice(0, 5) : []; // only accept up to 5 prior papers
    const imagesInput = Array.isArray(payload.images) ? payload.images : [];

    // Validate images size
    const MAX_BASE64_BYTES = 3 * 1024 * 1024;
    const images = [];
    for (const img of imagesInput) {
      const name = img?.name ?? null;
      const mime = img?.mime ?? null;
      const b64 = img?.b64 ?? null;
      const url = img?.url ?? null;
      const caption = img?.caption ?? null;
      if (b64 && typeof b64 === "string") {
        const approxBytes = Math.ceil((b64.length * 3) / 4);
        if (approxBytes > MAX_BASE64_BYTES) {
          return res.status(400).json({ success: false, error: `Image ${name || "unnamed"} too large (${Math.round(approxBytes / 1024)} KB).` });
        }
      }
      images.push({ name, mime, url, b64, caption });
    }

    // Build prompt (includes prior papers as context)
    const systemPrompt = `
You are a professional exam paper generator experienced with IB MYP, IB DP, IGCSE, A-Levels, CBSE, and ICSE.
Return ONLY a single VALID JSON object and NOTHING else. Follow this exact schema: 
{ "title": string, "metadata": { "board": string, "grade": number|string, "subject": string, "format": string, "difficulty": "Easy|Medium|Hard", "numQuestions": integer, "totalMarks": integer|null, "criteriaMode": boolean }, "sections": [...], "rubricNotes": [...], "images": [...] } 
Ensure:
- If criteriaMode true => totalMarks null and include weights in rubricNotes and modelAnswerOutline
- Use prior papers context below to avoid repeating identical questions; favor new variations and align cognitive demand to difficulty
- Include imageRefs only if filenames match provided images
- Output must be JSON only (no markdown, no extra commentary)
`;

    // attach prior contexts (brief)
    let priorContext = "";
    if (priorPapers.length) {
      priorContext = "Prior papers (summaries / examples):\n";
      priorPapers.forEach((p, i) => {
        const snippet = (typeof p === "string" && p.length > 800) ? p.slice(0, 800) + "..." : String(p);
        priorContext += `Paper ${i + 1}: ${snippet}\n\n`;
      });
    }

    const userPrompt = `
Board: ${board}
Grade: ${grade ?? "(unspecified)"}
Subject: ${subject || "(general)"}
Topics: ${topics.length ? topics.join(", ") : "(broad)"}
Format: ${format}
Difficulty: ${difficulty}
Number of questions: ${numQuestions}
Marks: ${marks === null ? "(criteria-based / not provided)" : marks}
Criteria: ${criteria ?? "(none)"}
AnythingElse: ${anythingElse || "(none)"}

${priorContext}
Images included (names): ${images.map(i => i.name || i.url || "unnamed").join(", ")}

Produce the JSON paper as described.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Call OpenAI
    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.18,
        max_tokens: 3000,
        top_p: 1,
      }),
    });

    if (!openaiResp.ok) {
      const text = await openaiResp.text();
      console.error("OpenAI error:", openaiResp.status, text.slice(0, 1000));
      return res.status(502).json({ success: false, error: "OpenAI API error", details: text });
    }

    const openaiJson = await openaiResp.json();
    const rawText = openaiJson?.choices?.[0]?.message?.content ?? openaiJson?.choices?.[0]?.text ?? "";

    // Balanced-brace extract helper
    function extractFirstJsonObject(text) {
      const firstBrace = text.indexOf("{");
      if (firstBrace === -1) return null;
      let depth = 0;
      for (let i = firstBrace; i < text.length; i++) {
        const ch = text[i];
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            return text.slice(firstBrace, i + 1);
          }
        }
      }
      return null;
    }

    let parsed = null;
    let parsedOk = false;
    try {
      parsed = JSON.parse(rawText);
      parsedOk = true;
    } catch (e) {
      const candidate = extractFirstJsonObject(rawText);
      if (candidate) {
        try {
          parsed = JSON.parse(candidate);
          parsedOk = true;
        } catch (e2) {
          parsedOk = false;
        }
      } else parsedOk = false;
    }

    // minimal validation
    if (parsedOk && parsed && typeof parsed === "object") {
      if (!parsed.metadata || !Array.isArray(parsed.sections)) parsedOk = false;
    }

    return res.status(200).json({
      success: true,
      parsed: parsedOk,
      paper: parsedOk ? parsed : null,
      raw: rawText,
      images,
      openai: { model: OPENAI_MODEL, usage: openaiJson?.usage ?? null },
    });
  } catch (err) {
    console.error("/api/paper-generator error:", err);
    return res.status(500).json({ success: false, error: "Server error", details: String(err) });
  }
}
