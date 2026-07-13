import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { normalizeReviewResponse } from '../_lib/reviewResponse.js';

function safeString(value, max = 12000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function buildAssistiveFeedback(body) {
  const marks = safeString(body.marks, 40) || 'unspecified';
  const strictness = Number(body.strictness ?? 5);
  const question = safeString(body.question, 6000);
  const answer = safeString(body.answer, 6000);
  const additional = safeString(body.additional, 2000);
  const notes = [];

  if (!question) {
    notes.push('Question text was not provided, so the feedback stays high-level.');
  }
  if (!answer) {
    notes.push('Student answer was not provided, so no answer-specific feedback is possible.');
  }
  if (additional) {
    notes.push(`Context noted: ${additional}`);
  }

  const answerLength = answer.split(/\s+/).filter(Boolean).length;
  const likelyMissingEvidence = answerLength > 0 && answerLength < 25;
  const likelyStructureIssue = answerLength > 0 && strictness >= 4;

  const bullets = [
    'Assistive feedback only: this review is not an official grade and does not replace a verified mark scheme or examiner judgment.',
    marks !== 'unspecified'
      ? `Target marks: ${marks}. A safe score is withheld unless grading is deterministic or reviewed against verified content.`
      : 'No reliable mark total can be issued from this input alone, so a score is withheld.',
    question
      ? `Question focus: ${question.slice(0, 220)}${question.length > 220 ? '...' : ''}`
      : 'Add the exact question wording to tighten command-term and coverage feedback.',
    answer
      ? `Your answer shows ${answerLength >= 60 ? 'substantial detail' : answerLength >= 25 ? 'some relevant detail' : 'limited detail'}, but this tool cannot certify marks from prose alone.`
      : 'Paste the exact student answer for answer-specific feedback.',
    likelyMissingEvidence
      ? 'Main improvement: add more evidence, steps, or explanation so each claim is supported.'
      : 'Main improvement: compare each sentence against the command term and ensure every required point is explicitly addressed.',
    likelyStructureIssue
      ? 'Structure tip: separate method, reasoning, and conclusion so a human marker can award each part cleanly.'
      : 'Structure tip: make each mark-worthy point easy to identify.',
    'Next best step: if this was from an approved VertexEd session, use the verified practice workspace for deterministic scoring where supported.',
  ];

  if (notes.length) {
    bullets.push(...notes);
  }

  return bullets.join('\n\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (rejectOversizedJsonBody(req, res, 256_000)) return;

  const body = readJsonBody(req);
  const output = buildAssistiveFeedback(body);
  return res.status(200).json(normalizeReviewResponse({ safe_text: output }));
}
