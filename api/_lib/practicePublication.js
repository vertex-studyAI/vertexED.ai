import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { hasExactContentApproval } from '../../contracts/contentPublication.js';
import { ADAPTIVE_QUESTION_BANK } from '../../src/content/adaptiveQuestionBank.mjs';

const register = createRequire(import.meta.url)('../../contracts/content-publication-approvals.json');

/** Server approval uses the original source and register, never browser transforms. */
export function publishedPracticeQuestions({ bank = ADAPTIVE_QUESTION_BANK, approvals = register.entries, now = Date.now() } = {}) {
  if (!Array.isArray(approvals) || new Set(approvals.map(item => item.path)).size !== approvals.length) return [];
  const byPath = new Map(approvals.map(item => [item.path, item]));
  return bank.flatMap(question => {
    const contentRevision = `sha256:${createHash('sha256').update(JSON.stringify(question)).digest('hex')}`;
    const path = `module:/src/content/adaptiveQuestionBank.mjs#${encodeURIComponent(question.id)}`;
    return hasExactContentApproval(byPath.get(path), contentRevision, now) ? [{ ...question, contentRevision }] : [];
  });
}
