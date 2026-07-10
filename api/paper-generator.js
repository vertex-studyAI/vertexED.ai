import { verifyAuthUser, rejectOversizedJsonBody } from './_lib/auth.js';
import { rateLimitUserEndpoint } from './_lib/rateLimit.js';

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4.1";
const MAX_BASE64_BYTES = 3 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;

function normalizeDifficulty(input) {
  const map = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };
  return map[String(input || "").toLowerCase()] || "Medium";
}

function normalizeTopics(topicsRaw) {
  if (Array.isArray(topicsRaw)) {
    return topicsRaw.map(String).map((t) => t.trim()).filter(Boolean);
  }
  if (typeof topicsRaw === "string") {
    return topicsRaw.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function validateImages(imagesInput = []) {
  if (!Array.isArray(imagesInput)) return [];

  const seen = new Set();
  const out = [];

  for (const img of imagesInput.slice(0, 10)) {
    const { name, mime, b64, url, caption } = img || {};
    if (!name && !url) continue;

    if (b64 && typeof b64 === "string") {
      const approxBytes = Math.ceil((b64.length * 3) / 4);
      if (approxBytes > MAX_BASE64_BYTES) {
        throw new Error(`Image ${name || "unnamed"} exceeds size limit`);
      }
    }

    const key = name || url;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      name: name || null,
      mime: mime || null,
      b64: b64 || null,
      url: url || null,
      caption: caption || null,
    });
  }

  return out;
}

function buildSystemPrompt() {
  return `
You are a senior exam-paper architect for IB MYP, IB DP, IGCSE, A-Levels, CBSE, and ICSE.

You MUST return exactly one JSON object that conforms to the provided schema.
No markdown. No commentary. No explanations.

Core rules:
- Questions must match board rigor and stated difficulty.
- Avoid verbatim or near-verbatim reuse from prior papers.
- Increase cognitive demand with difficulty (recall → application → synthesis).
- If criteriaMode = true:
  - metadata.totalMarks MUST be null
  - rubricNotes MUST include weights
- imageRefs may ONLY reference provided image names.
`;
}

function buildUserPrompt(data) {
  const {
    board,
    grade,
    subject,
    topics,
    format,
    difficulty,
    numQuestions,
    marks,
    criteria,
    criteriaMode,
    anythingElse,
    priorPapers,
    images,
  } = data;

  let priorContext = "";
  if (priorPapers.length) {
    priorContext = "PRIOR PAPERS (for variation, NOT reuse):\n";
    priorPapers.forEach((p, i) => {
      const text = String(p);
      priorContext += `Paper ${i + 1}: ${text.slice(0, 700)}\n\n`;
    });
  }

  return `
Board: ${board}
Grade: ${grade ?? "unspecified"}
Subject: ${subject || "general"}
Topics: ${topics.length ? topics.join(", ") : "broad"}
Format: ${format}
Difficulty: ${difficulty}
Number of questions: ${numQuestions}
Marks: ${marks === null ? "criteria-based" : marks}
Criteria mode: ${criteriaMode ? "yes" : "no"}
Criteria: ${criteria ?? "none"}
AnythingElse: ${anythingElse || "none"}

Images available: ${images.map((i) => i.name || i.url).join(", ")}

${priorContext}
`;
}

function parsePaperContent(content) {
  if (!content) return null;
  if (typeof content === "object") return content;
  if (typeof content !== "string") return null;

  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}") + 1;
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(content.slice(start, end));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!rateLimitUserEndpoint(user.id, 'paper-generator', res)) return;

  if (rejectOversizedJsonBody(req, res, 4 * 1024 * 1024)) return;

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.ChatbotKey;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "OpenAI API key missing" });
    }

    const payload = req.body ?? {};
    const criteriaMode = Boolean(payload.criteria ?? payload.marks === null);

    const data = {
      board: String(payload.board ?? "IB MYP"),
      grade: payload.grade ?? null,
      subject: String(payload.subject ?? ""),
      topics: normalizeTopics(payload.topics),
      marks: typeof payload.marks === "number" ? payload.marks : null,
      criteria: payload.criteria ?? null,
      criteriaMode,
      numQuestions: Math.max(1, Math.min(50, Number(payload.numQuestions ?? 10))),
      format: payload.format ?? "Mixed Format",
      difficulty: normalizeDifficulty(payload.difficulty),
      anythingElse: String(payload.anythingElse ?? ""),
      priorPapers: Array.isArray(payload.priorPapers) ? payload.priorPapers.slice(0, 5) : [],
      images: validateImages(payload.images),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const openaiResp = await fetch(OPENAI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        temperature: 0.15,
        max_tokens: 3500,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(data) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "exam_paper",
            schema: {
              type: "object",
              required: ["title", "metadata", "sections", "rubricNotes", "images"],
              properties: {
                title: { type: "string" },
                metadata: {
                  type: "object",
                  required: [
                    "board",
                    "grade",
                    "subject",
                    "format",
                    "difficulty",
                    "numQuestions",
                    "totalMarks",
                    "criteriaMode",
                  ],
                  properties: {
                    board: { type: "string" },
                    grade: { type: ["number", "string"] },
                    subject: { type: "string" },
                    format: { type: "string" },
                    difficulty: { enum: ["Easy", "Medium", "Hard"] },
                    numQuestions: { type: "integer" },
                    totalMarks: { type: ["integer", "null"] },
                    criteriaMode: { type: "boolean" },
                  },
                },
                sections: { type: "array" },
                rubricNotes: { type: "array" },
                images: { type: "array" },
              },
            },
          },
        },
      }),
    });

    clearTimeout(timeout);

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      return res.status(502).json({
        success: false,
        error: "OpenAI API error",
        details: errText.slice(0, 800),
      });
    }

    const result = await openaiResp.json();
    const rawPaper = result?.choices?.[0]?.message?.content;

    if (!rawPaper) {
      return res.status(422).json({ success: false, error: "Empty model output" });
    }

    const parsedPaper = parsePaperContent(rawPaper);
    if (!parsedPaper) {
      return res.status(422).json({
        success: false,
        error: "Could not parse paper JSON from model",
        raw: typeof rawPaper === "string" ? rawPaper.slice(0, 2000) : String(rawPaper),
      });
    }

    if (Array.isArray(data.images) && data.images.length) {
      parsedPaper.images = [...(parsedPaper.images || []), ...data.images];
    }

    return res.status(200).json({
      success: true,
      parsed: true,
      paper: parsedPaper,
      images: data.images,
      openai: {
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        usage: result.usage ?? null,
      },
    });
  } catch (err) {
    const isAbort = err.name === "AbortError";
    return res.status(isAbort ? 504 : 500).json({
      success: false,
      error: isAbort ? "OpenAI request timed out" : "Server error",
      details: String(err),
    });
  }
}
