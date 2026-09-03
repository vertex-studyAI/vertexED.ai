import { verifyAuthUser, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import {
  buildDeterministicPaperFallback,
  buildGenerationMetadata,
  normalizeGeneratedPaper,
} from '../_lib/learningArtifactFallbacks.js';

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4.1";
const MAX_BASE64_BYTES = 3 * 1024 * 1024;
const MAX_IMAGES = 10;
const REQUEST_TIMEOUT_MS = 30_000;
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

class InputValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "InputValidationError";
  }
}

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

function decodedBase64Bytes(value) {
  if (!value) return 0;
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  return Math.floor((value.length * 3) / 4) - padding;
}

export function validateImages(imagesInput = []) {
  if (!Array.isArray(imagesInput)) {
    throw new InputValidationError("Images must be an array");
  }
  if (imagesInput.length > MAX_IMAGES) {
    throw new InputValidationError(`At most ${MAX_IMAGES} images are allowed`);
  }

  const seen = new Set();
  const out = [];

  for (const rawImage of imagesInput) {
    if (!rawImage || typeof rawImage !== "object" || Array.isArray(rawImage)) {
      throw new InputValidationError("Each image must be an object");
    }

    const name = typeof rawImage.name === "string" ? rawImage.name.trim() : "";
    const mime = typeof rawImage.mime === "string" ? rawImage.mime.trim().toLowerCase() : "";
    const b64 = typeof rawImage.b64 === "string" ? rawImage.b64.trim() : "";
    const url = typeof rawImage.url === "string" ? rawImage.url.trim() : "";
    const caption = typeof rawImage.caption === "string" ? rawImage.caption.slice(0, 500) : null;

    if (!name && !url) {
      throw new InputValidationError("Each image requires a name or URL");
    }

    if (b64) {
      if (!name) {
        throw new InputValidationError("Uploaded images require a file name");
      }
      if (!ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
        throw new InputValidationError(`Unsupported image type for ${name}`);
      }
      if (b64.startsWith("data:") || b64.length % 4 !== 0 || !BASE64_RE.test(b64)) {
        throw new InputValidationError(`Image ${name} contains malformed base64 data`);
      }
      if (decodedBase64Bytes(b64) > MAX_BASE64_BYTES) {
        throw new InputValidationError(`Image ${name} exceeds size limit`);
      }
    } else if (mime && !ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
      throw new InputValidationError(`Unsupported image type for ${name || "image"}`);
    }

    if (url) {
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        throw new InputValidationError("Image URL is invalid");
      }
      if (parsedUrl.protocol !== "https:") {
        throw new InputValidationError("Image URLs must use HTTPS");
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
      caption,
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

function fallbackPaperResponse(data, failureClass) {
  const source = JSON.stringify({
    board: data.board,
    grade: data.grade,
    subject: data.subject,
    topics: data.topics,
    marks: data.marks,
    criteria: data.criteria,
    criteriaMode: data.criteriaMode,
    numQuestions: data.numQuestions,
    format: data.format,
    difficulty: data.difficulty,
  });
  return {
    success: true,
    parsed: true,
    paper: buildDeterministicPaperFallback(data),
    images: data.images,
    openai: null,
    generation: buildGenerationMetadata({
      capability: 'paper',
      mode: 'deterministic-fallback',
      source,
      failureClass,
    }),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!(await rateLimitUserEndpoint(user.id, 'paper-generator', res))) return;

  if (rejectOversizedJsonBody(req, res, 4 * 1024 * 1024)) return;

  try {
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

    const apiKey = process.env.OPENAI_API_KEY || process.env.ChatbotKey;
    if (!apiKey) {
      return res.status(200).json(fallbackPaperResponse(data, 'provider_unconfigured'));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let openaiResp;
    try {
      openaiResp = await fetch(OPENAI_URL, {
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
                      "board", "grade", "subject", "format", "difficulty",
                      "numQuestions", "totalMarks", "criteriaMode",
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
    } catch (error) {
      return res.status(200).json(fallbackPaperResponse(
        data,
        error?.name === 'AbortError' ? 'provider_timeout' : 'provider_failure',
      ));
    } finally {
      clearTimeout(timeout);
    }

    if (!openaiResp.ok) {
      return res.status(200).json(fallbackPaperResponse(data, 'provider_failure'));
    }

    let result;
    try {
      result = await openaiResp.json();
    } catch {
      return res.status(200).json(fallbackPaperResponse(data, 'malformed_provider_response'));
    }
    const rawPaper = result?.choices?.[0]?.message?.content;

    if (!rawPaper) {
      return res.status(200).json(fallbackPaperResponse(data, 'empty_model_output'));
    }

    const parsedPaper = normalizeGeneratedPaper(parsePaperContent(rawPaper), data);
    if (!parsedPaper) {
      return res.status(200).json(fallbackPaperResponse(data, 'malformed_model_output'));
    }

    if (Array.isArray(data.images) && data.images.length) {
      parsedPaper.images = [...parsedPaper.images, ...data.images];
    }
    const source = JSON.stringify({
      board: data.board,
      grade: data.grade,
      subject: data.subject,
      topics: data.topics,
      marks: data.marks,
      criteria: data.criteria,
      criteriaMode: data.criteriaMode,
      numQuestions: data.numQuestions,
      format: data.format,
      difficulty: data.difficulty,
    });
    const generation = buildGenerationMetadata({
      capability: 'paper',
      mode: 'model',
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      source,
    });
    parsedPaper.provenance = {
      ...(parsedPaper.provenance && typeof parsedPaper.provenance === 'object' ? parsedPaper.provenance : {}),
      sourceDigest: generation.sourceDigest,
      board: data.board,
      grade: data.grade,
      subject: data.subject,
      topics: data.topics,
    };

    return res.status(200).json({
      success: true,
      parsed: true,
      paper: parsedPaper,
      images: data.images,
      openai: {
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        usage: result.usage ?? null,
      },
      generation,
    });
  } catch (err) {
    if (err?.name === "InputValidationError") {
      return res.status(400).json({ success: false, error: err.message });
    }
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
}
