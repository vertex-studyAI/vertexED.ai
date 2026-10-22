import { readFile } from 'node:fs/promises';
import { join, normalize, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { hasPublicationEvidence, hasExactContentApproval } from '../../contracts/contentPublication.js';

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'what', 'when', 'where', 'which', 'from', 'into', 'about', 'have', 'does', 'should', 'would', 'could', 'your', 'you', 'are', 'how', 'why', 'can', 'all', 'any', 'use', 'using']);

function tokens(text) {
  return Array.from(new Set(String(text).toLowerCase().match(/[a-z0-9]{2,}/g)?.filter((token) => !STOP_WORDS.has(token)) ?? []));
}

/** Resolve a guide path under public/ and reject traversal outside that root. */
export function resolvePublicGuidePath(root, relativePath) {
  const cleaned = String(relativePath || '').replace(/^\/+/, '');
  if (!cleaned || cleaned.includes('\0')) {
    throw new Error('Invalid study guide path');
  }
  const resolvedRoot = resolve(root);
  const candidate = resolve(resolvedRoot, cleaned);
  const prefix = resolvedRoot.endsWith(sep) ? resolvedRoot : `${resolvedRoot}${sep}`;
  if (candidate !== resolvedRoot && !candidate.startsWith(prefix)) {
    throw new Error('Invalid study guide path');
  }
  // Only markdown guides under study-guides/ are loadable.
  const normalized = normalize(cleaned).replace(/\\/g, '/');
  if (!normalized.startsWith('study-guides/') || !normalized.endsWith('.md')) {
    throw new Error('Invalid study guide path');
  }
  return candidate;
}

export async function loadGuideDocuments({ root = join(process.cwd(), 'public'), approvalPath = join(root, '..', 'contracts/content-publication-approvals.json') } = {}) {
  const manifest = JSON.parse(await readFile(join(root, 'study-guides/myp/manifest.json'), 'utf8'));
  const register = JSON.parse(await readFile(approvalPath, 'utf8'));
  if (register.schemaVersion !== 1 || !Array.isArray(register.entries)) throw new Error('Invalid content approval register.');
  const approved = new Map(register.entries.filter(isApprovedGuide).map(entry => [entry.path, entry]));
  const pages = await Promise.all(manifest.subjects.flatMap((subject) => subject.pages.filter(page => approved.has(page.path)).map(async (page) => {
    const content = await readFile(resolvePublicGuidePath(root, page.path), 'utf8');
    const hash = `sha256:${createHash('sha256').update(content).digest('hex')}`;
    if (!hasExactContentApproval(approved.get(page.path), hash)) return null;
    return { subject: subject.name, subjectSlug: subject.slug, title: page.title, relativePath: page.relativePath, sourcePath: page.path, content, contentHash: hash };
  })));
  return pages.filter(Boolean);
}

function phraseScore(text, question) {
  const normalizedQuestion = String(question).toLowerCase();
  const phrases = normalizedQuestion.match(/[a-z][a-z0-9]+(?:\s+[a-z][a-z0-9]+){1,4}/g) ?? [];
  const lower = text.toLowerCase();
  return phrases.reduce((score, phrase) => score + (lower.split(phrase).length - 1) * 120, 0);
}

function documentScore(document, queryTokens, question, currentGuidePath) {
  const title = `${document.subject} ${document.title} ${document.relativePath}`.toLowerCase();
  const content = document.content.toLowerCase();
  const tokenScore = queryTokens.reduce((score, token) => {
    const titleHits = title.split(token).length - 1;
    const contentHits = content.split(token).length - 1;
    return score + titleHits * 60 + Math.min(contentHits, 10);
  }, 0);
  const isCurrentGuide = currentGuidePath && document.sourcePath.replace(/\.md$/i, '') === currentGuidePath;
  const frequencyQuestion = /\b(how many|how often|times|frequency|papers?|assessment)\b/i.test(question);
  const overviewBoost = frequencyQuestion && document.relativePath.toLowerCase() === 'overview.md' ? 250 : 0;
  return tokenScore + phraseScore(content, question) + overviewBoost + (isCurrentGuide ? 10_000 : 0);
}

function excerpt(document, question, limit = 2200) {
  const source = document.content.replace(/\r/g, '');
  const lower = source.toLowerCase();
  const queryTokens = tokens(question);
  const phraseMatches = [];
  for (let index = 0; index < queryTokens.length - 1; index += 1) {
    const phrase = `${queryTokens[index]} ${queryTokens[index + 1]}`;
    const matchIndex = lower.indexOf(phrase);
    if (matchIndex >= 0) phraseMatches.push({ phrase, matchIndex });
  }
  const strongestPhrase = phraseMatches.sort((a, b) => b.phrase.length - a.phrase.length)[0];
  const rareTokenMatch = queryTokens
    .map((token) => ({ token, matchIndex: lower.indexOf(token), hits: lower.split(token).length - 1 }))
    .filter(({ matchIndex }) => matchIndex >= 0)
    .sort((a, b) => a.hits - b.hits || b.token.length - a.token.length)[0];
  const firstMatch = strongestPhrase?.matchIndex ?? rareTokenMatch?.matchIndex ?? 0;
  // Preserve the complete Markdown section/table around a match instead of
  // starting at the first occurrence of a generic subject word in the title.
  const headingBeforeMatch = source.lastIndexOf('\n##', firstMatch);
  const paragraphBeforeMatch = source.lastIndexOf('\n\n', firstMatch);
  const start = Math.max(0, headingBeforeMatch >= 0 ? headingBeforeMatch + 1 : paragraphBeforeMatch + 2);
  const end = Math.min(source.length, start + limit);
  return source.slice(start, end).trim();
}

export async function retrieveStudyGuideContext(question, { currentGuidePath } = {}) {
  // Re-read review state so revocation, expiry or edited bytes cannot survive a
  // warm serverless instance's previous retrieval cache.
  const documents = await loadGuideDocuments();
  const queryTokens = tokens(question);
  const mentionedSubject = Array.from(new Set(documents.map((document) => document.subject))).find((subject) => queryTokens.includes(subject.toLowerCase()));
  const candidates = mentionedSubject ? documents.filter((document) => document.subject === mentionedSubject) : documents;
  const matches = candidates
    .map((document) => ({ document, score: documentScore(document, queryTokens, question, currentGuidePath) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return matches.map(({ document }) => ({
    label: `${document.subject} - ${document.title}`,
    path: document.relativePath,
    text: excerpt(document, question),
  }));
}

export function isApprovedGuide(entry) {
  return hasPublicationEvidence(entry);
}
