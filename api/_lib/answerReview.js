import { normalizeGradeAudits } from './verifiedGrading.js';

export const ANSWER_REVIEW_CONTRACT_VERSION = 'vertexed.answer-review.v1';

function cleanText(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function boundedInteger(value, min, max, fallback) {
  const number = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function slug(value, fallback) {
  const normalized = cleanText(value, 100)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

export function normalizeAnswerReviewInput(body = {}, extracted = {}) {
  const questionText = cleanText(body.question, 12_000);
  const answerText = cleanText(body.answer, 20_000);
  const extractedQuestion = cleanText(extracted.question, 12_000);
  const extractedAnswer = cleanText(extracted.answer, 20_000);
  const question = [questionText, extractedQuestion && `Image transcription/context:\n${extractedQuestion}`]
    .filter(Boolean)
    .join('\n\n');
  const answer = [answerText, extractedAnswer && `Image transcription/context:\n${extractedAnswer}`]
    .filter(Boolean)
    .join('\n\n');

  return {
    curriculum: cleanText(body.curriculum, 120),
    subject: cleanText(body.subject, 120),
    grade: cleanText(body.grade, 40),
    marks: boundedInteger(body.marks, 1, 100, 5),
    question,
    answer,
    context: cleanText(body.context ?? body.additional, 12_000),
    strictness: boundedInteger(body.strictness, 1, 10, 5),
  };
}

export function buildAnswerReviewQuestion(input) {
  const subject = slug(input.subject, 'general');
  const curriculum = slug(input.curriculum, 'general');
  return {
    id: 'answer-review',
    type: 'frq',
    prompt: input.question,
    maxScore: input.marks,
    objectiveIds: [`${curriculum}:${subject}:answer-review`],
  };
}

export function buildAnswerReviewPrompt(input) {
  return `Review one student response using only the supplied question, answer, and optional marking context.

Curriculum: ${input.curriculum || 'Not specified'}
Subject: ${input.subject || 'Not specified'}
Grade: ${input.grade || 'Not specified'}
Marks available: ${input.marks}
Feedback strictness: ${input.strictness}/10

QUESTION:
${input.question}

STUDENT ANSWER:
${input.answer}

MARK SCHEME OR CONTEXT (may be absent and is not authoritative unless clearly identified as a mark scheme):
${input.context || 'None supplied'}

Return JSON only with this shape:
{
  "grade": {
    "id": "answer-review",
    "score": 0,
    "maxScore": ${input.marks},
    "feedback": "Concise overall feedback",
    "includes": "What the answer demonstrably covered",
    "confidence": 0.0,
    "criteria": [
      {
        "id": "criterion-id",
        "label": "Criterion label",
        "score": 0,
        "maxScore": 1,
        "feedback": "Criterion-specific feedback and concrete retry",
        "evidenceQuotes": ["exact short quote copied from STUDENT ANSWER"]
      }
    ],
    "errorCodes": []
  }
}

Rules:
- The criterion maxScore values must sum to exactly ${input.marks}.
- Never award credit without at least one exact quote from the student answer for that criterion.
- Quotes must be copied verbatim; do not quote the question, context, or your own paraphrase.
- If the supplied context is insufficient for board-specific marking, lower confidence and say so.
- Use only these error codes when supported: CONCEPT_GAP, EVIDENCE_GAP, REASONING_GAP, COMMAND_TERM, CALCULATION, COMMUNICATION, INCOMPLETE.
- Do not claim this is an official grade, examiner decision, or teacher assessment.
- Give a specific next-attempt action, not generic encouragement.`;
}

export function extractAnswerReviewGrade(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}') + 1;
    if (start < 0 || end <= start) return null;
    try {
      parsed = JSON.parse(raw.slice(start, end));
    } catch {
      return null;
    }
  }
  return parsed?.grade && typeof parsed.grade === 'object' ? parsed.grade : null;
}

function formatPercent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

export function formatAnswerReview(audit) {
  const status = audit.scoreStatus === 'VERIFIED' ? 'Evidence-verified AI review' : 'Provisional AI review';
  const lines = [
    `## ${status}`,
    '',
    `**Suggested mark:** ${audit.score}/${audit.maxScore}`,
    `**Confidence:** ${formatPercent(audit.confidence)}`,
    '',
  ];
  if (audit.humanReviewRequired) {
    lines.push(`> This mark is provisional and must not update mastery. ${audit.escalationReason || 'Human review is required.'}`, '');
  }
  if (audit.feedback) lines.push('### Overall feedback', '', audit.feedback, '');
  if (audit.includes) lines.push('### Demonstrated in the answer', '', audit.includes, '');
  if (audit.criteria.length) {
    lines.push('### Criteria', '');
    for (const criterion of audit.criteria) {
      lines.push(`- **${criterion.label}: ${criterion.score}/${criterion.maxScore}.** ${criterion.feedback || 'No criterion feedback returned.'}`);
      for (const evidence of criterion.evidence) lines.push(`  - Evidence: “${evidence.quote}”`);
      if (!criterion.evidenceVerified) lines.push('  - No exact answer evidence was verified for awarded credit.');
    }
    lines.push('');
  }
  if (audit.errors.length) {
    lines.push('### What to fix next', '');
    for (const error of audit.errors) lines.push(`- ${error.label}`);
    lines.push('');
  }
  lines.push('Compare this feedback with your current mark scheme or teacher guidance before relying on the mark.');
  return lines.join('\n');
}

export function createAnswerReviewResult({ input, rawGrade = null, model = 'unavailable', degraded = false }) {
  const question = buildAnswerReviewQuestion(input);
  const fallbackGrade = {
    id: question.id,
    score: 0,
    maxScore: question.maxScore,
    confidence: 0,
    feedback: 'Automated marking was unavailable, so no credit has been assigned. Your submission is preserved for a retry.',
    includes: '',
    criteria: [{
      id: 'overall', label: 'Overall response', score: 0, maxScore: question.maxScore,
      feedback: 'Retry the review when automated marking is available, or compare the response with a current mark scheme.',
      evidenceQuotes: [],
    }],
    errorCodes: input.answer ? [] : ['INCOMPLETE'],
  };
  const { audits, coverage } = normalizeGradeAudits({
    questions: [question],
    userAnswers: { [question.id]: input.answer },
    rawGrades: [rawGrade ?? fallbackGrade],
    model,
  });
  const review = audits[0];
  const output = formatAnswerReview(review);
  return {
    contractVersion: ANSWER_REVIEW_CONTRACT_VERSION,
    gradingContractVersion: review.contractVersion,
    review,
    coverage,
    degraded,
    blocked: false,
    safe_text: output,
    output,
  };
}
