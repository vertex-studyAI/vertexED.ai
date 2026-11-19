/**
 * Index over the local copy of the MYP study-guide wiki.
 *
 * The wiki lives as Markdown under public/study-guides/myp/, catalogued by
 * manifest.json. Pages are large and table-heavy, so everything here works at
 * *section* granularity: a question about "M24 question 3" should return the
 * one heading that covers it, not the whole 68-page paper breakdown.
 *
 * This module is the single source of truth for both consumers of the wiki:
 * the MCP server in mcp/server.js and the in-process MCP client used by the
 * study-guide chat endpoint.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGuideDocuments } from '../api/_lib/studyGuideRetrieval.js';

const MANIFEST_RELATIVE_PATH = 'study-guides/myp/manifest.json';
const SITE_GUIDE_PREFIX = '/study-guides/myp';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'what', 'when', 'where', 'which', 'from', 'into',
  'about', 'have', 'does', 'should', 'would', 'could', 'your', 'you', 'are', 'how', 'why', 'can',
  'all', 'any', 'use', 'using', 'was', 'were', 'been', 'has', 'its', 'they', 'them', 'there',
  'their', 'than', 'then', 'some', 'more', 'most', 'other', 'such', 'only', 'also', 'get', 'got',
]);

/** public/ as resolved from this module, so a client may launch the server from any cwd. */
const BUNDLED_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

/** Root directory that contains study-guides/. Overridable so tests can point at a fixture. */
export function wikiRoot() {
  if (process.env.WIKI_ROOT) return process.env.WIKI_ROOT;
  // cwd first: on Vercel the function runs from the project root and the wiki
  // arrives via includeFiles, which puts it there rather than beside this file.
  const fromCwd = join(process.cwd(), 'public');
  if (existsSync(join(fromCwd, MANIFEST_RELATIVE_PATH))) return fromCwd;
  return BUNDLED_ROOT;
}

function tokenize(text) {
  const matches = String(text).toLowerCase().match(/[a-z0-9]{2,}/g) ?? [];
  return Array.from(new Set(matches.filter((token) => !STOP_WORDS.has(token))));
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Route the site serves this page at, e.g. /study-guides/myp/physics/sessions/m24. */
function pageUrl(subjectSlug, relativePath) {
  const route = relativePath
    .replace(/\.md$/i, '')
    .split('/')
    .map((part) => encodeURIComponent(part.toLowerCase()))
    .join('/');
  return `${SITE_GUIDE_PREFIX}/${subjectSlug}/${route}`;
}

/**
 * Split Markdown into heading-delimited sections. Fenced code blocks are
 * skipped so a `#` comment inside a fence never starts a bogus section.
 */
function splitSections(markdown, fallbackHeading) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let current = { heading: fallbackHeading, level: 1, lines: [], implicit: true };
  let insideFence = false;

  const flush = () => {
    const text = current.lines.join('\n').trim();
    // Drop an empty implicit preamble, but keep empty real headings: they are
    // still valid navigation targets whose content sits in child sections.
    if (current.implicit && !text) return;
    sections.push({
      heading: current.heading,
      level: current.level,
      anchor: slugify(current.heading) || `section-${sections.length + 1}`,
      text,
    });
  };

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) insideFence = !insideFence;
    const heading = insideFence ? null : /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (heading) {
      flush();
      current = { heading: heading[2].trim(), level: heading[1].length, lines: [], implicit: false };
      continue;
    }
    current.lines.push(line);
  }
  flush();

  // Disambiguate repeated headings so `read_wiki_section` can address each one.
  const used = new Set();
  for (const section of sections) {
    const base = section.anchor;
    let suffix = 2;
    while (used.has(section.anchor)) section.anchor = `${base}-${suffix++}`;
    used.add(section.anchor);
  }

  return sections;
}

function humanTitle(page) {
  if (page.relativePath === 'index.md') return 'Guide index';
  if (page.relativePath === 'overview.md') return 'Overview';
  if (/^[mn]\d{2}$/i.test(page.title)) return page.title.toUpperCase();
  return page.title.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function buildIndex() {
  const root = wikiRoot();
  const documents = await loadGuideDocuments({ root });
  const pages = documents.map((page) => {
        const title = humanTitle(page);
        return {
          id: `${page.subjectSlug}/${page.relativePath}`,
          subject: page.subject,
          subjectSlug: page.subjectSlug,
          title,
          label: `${page.subject} - ${title}`,
          relativePath: page.relativePath,
          sourcePath: page.sourcePath,
          url: pageUrl(page.subjectSlug, page.relativePath),
          content: page.content,
          contentHash: page.contentHash,
          sections: splitSections(page.content, title),
        };
  });

  return {
    programme: 'MYP',
    subjects: [...new Map(pages.map(page => [page.subjectSlug, { name: page.subject, slug: page.subjectSlug }])).values()],
    pages,
    pagesById: new Map(pages.map((page) => [page.id.toLowerCase(), page])),
  };
}

/** Recheck review state and exact bytes on every call, including warm instances. */
export function loadWikiIndex() {
  return buildIndex();
}

/**
 * Resolve any of the shapes a caller might hold onto a page:
 *   physics/overview.md, physics/overview, /study-guides/myp/physics/overview.md,
 *   /study-guides/myp/physics/sessions/m24
 */
export function resolvePage(index, pathLike) {
  if (!pathLike) return null;
  const normalized = String(pathLike)
    .trim()
    .replace(/^\/+/, '')
    .replace(/^study-guides\/myp\//i, '')
    .replace(/\.md$/i, '')
    .toLowerCase();
  if (!normalized) return null;
  return (
    index.pagesById.get(`${normalized}.md`) ??
    index.pages.find((page) => page.id.toLowerCase() === normalized) ??
    index.pages.find((page) => page.url.toLowerCase() === `${SITE_GUIDE_PREFIX}/${normalized}`) ??
    null
  );
}

function subjectFromQuery(index, queryTokens) {
  return index.subjects.find((subject) => {
    const words = subject.slug.split('-');
    return words.every((word) => queryTokens.includes(word));
  });
}

function scoreSection(section, page, queryTokens, normalizedQuery) {
  const headingText = `${page.subject} ${page.title} ${section.heading}`.toLowerCase();
  const bodyText = section.text.toLowerCase();

  let score = queryTokens.reduce((total, token) => {
    const headingHits = countOccurrences(headingText, token);
    const bodyHits = Math.min(countOccurrences(bodyText, token), 8);
    return total + headingHits * 50 + bodyHits * 4;
  }, 0);

  // Whole-phrase matches are far stronger evidence than scattered tokens.
  if (normalizedQuery.length >= 6) {
    if (headingText.includes(normalizedQuery)) score += 300;
    if (bodyText.includes(normalizedQuery)) score += 150;
  }
  return score;
}

function snippet(section, queryTokens, limit) {
  const text = section.text;
  if (text.length <= limit) return text;

  const lower = text.toLowerCase();
  const firstHit = queryTokens
    .map((token) => lower.indexOf(token))
    .filter((position) => position >= 0)
    .sort((a, b) => a - b)[0] ?? 0;

  // Snap to line boundaries so Markdown tables stay readable.
  const start = Math.max(0, text.lastIndexOf('\n', Math.max(0, firstHit - Math.floor(limit / 3))) + 1);
  const rawEnd = Math.min(text.length, start + limit);
  const end = rawEnd < text.length ? text.lastIndexOf('\n', rawEnd) : rawEnd;
  const slice = text.slice(start, end > start ? end : rawEnd).trim();
  return `${start > 0 ? '...\n' : ''}${slice}${end < text.length ? '\n...' : ''}`;
}

/**
 * Rank wiki sections against a natural-language query.
 *
 * @param {object} index          from loadWikiIndex()
 * @param {string} query
 * @param {object} [options]
 * @param {string} [options.subject]      restrict to a subject name or slug
 * @param {number} [options.limit]        max results (default 6)
 * @param {number} [options.snippetChars] snippet budget per result (default 900)
 * @param {string} [options.boostPath]    page the reader currently has open
 */
export function searchWiki(index, query, options = {}) {
  const { subject, limit = 6, snippetChars = 900, boostPath } = options;
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const normalizedQuery = String(query).trim().toLowerCase();
  const requestedSubject = subject ? String(subject).trim().toLowerCase() : null;
  const inferredSubject = requestedSubject ? null : subjectFromQuery(index, queryTokens);
  const boostedPage = boostPath ? resolvePage(index, boostPath) : null;

  const candidates = index.pages.filter((page) => {
    if (requestedSubject) {
      return page.subjectSlug === requestedSubject || page.subject.toLowerCase() === requestedSubject;
    }
    if (inferredSubject) return page.subjectSlug === inferredSubject.slug;
    return true;
  });

  const results = [];
  for (const page of candidates) {
    for (const section of page.sections) {
      let score = scoreSection(section, page, queryTokens, normalizedQuery);
      if (score <= 0) continue;
      // The page on screen is the likeliest referent of "this", "here", "it".
      if (boostedPage && page.id === boostedPage.id) score += 120;
      results.push({ page, section, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 12)))
    .map(({ page, section, score }) => ({
      pagePath: page.id,
      subject: page.subject,
      pageTitle: page.title,
      label: page.label,
      heading: section.heading,
      anchor: section.anchor,
      url: page.url,
      contentHash: page.contentHash,
      score,
      text: snippet(section, queryTokens, snippetChars),
    }));
}

/** Full page text, truncated on a line boundary when it exceeds maxChars. */
export function readPage(page, maxChars = 12000) {
  const content = page.content.replace(/\r\n/g, '\n').trim();
  if (content.length <= maxChars) return { text: content, truncated: false };
  const cut = content.lastIndexOf('\n', maxChars);
  return { text: content.slice(0, cut > 0 ? cut : maxChars), truncated: true };
}

/** Look a section up by anchor slug, exact heading, or a loose heading match. */
export function findSection(page, sectionRef) {
  const wanted = String(sectionRef ?? '').trim().toLowerCase();
  if (!wanted) return null;
  const wantedSlug = slugify(wanted);
  return (
    page.sections.find((section) => section.anchor === wantedSlug) ??
    page.sections.find((section) => section.heading.toLowerCase() === wanted) ??
    page.sections.find((section) => section.heading.toLowerCase().includes(wanted)) ??
    null
  );
}

/**
 * A section plus everything nested under it, so asking for "Paper Structure
 * Table" returns its subsections too rather than just the intro line.
 */
export function sectionWithChildren(page, section) {
  const startIndex = page.sections.indexOf(section);
  const parts = [];
  for (let index = startIndex; index < page.sections.length; index += 1) {
    const candidate = page.sections[index];
    if (index > startIndex && candidate.level <= section.level) break;
    parts.push(`${'#'.repeat(candidate.level)} ${candidate.heading}\n\n${candidate.text}`.trim());
  }
  return parts.join('\n\n');
}
