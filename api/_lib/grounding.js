/**
 * Shared source-grounding helpers for Apex chat and notebook generation.
 */

const DEFAULT_MAX_CHARS = 80_000;

function normalizeSourceId(value, index) {
  const normalized = typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-|-$)/g, '')
    : '';
  return normalized || `source-${index + 1}`;
}

/**
 * Build the canonical source registry used by both the prompt and response validator.
 * Duplicate client IDs are made unique so one citation can never resolve ambiguously.
 *
 * @param {Array<{ id?: string; title?: string; excerpt?: string; content?: string }>} sources
 */
export function buildSourceRegistry(sources) {
  if (!Array.isArray(sources)) return [];

  const usedIds = new Set();
  return sources.flatMap((source, index) => {
    if (!source || typeof source !== 'object') return [];

    const text = (
      typeof source.excerpt === 'string'
        ? source.excerpt
        : typeof source.content === 'string'
          ? source.content
          : ''
    ).trim();
    if (!text) return [];

    const baseId = normalizeSourceId(source.id, index);
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    const title = typeof source.title === 'string' && source.title.trim()
      ? source.title.trim().replace(/[\r\n]+/g, ' ').slice(0, 120)
      : 'Untitled source';

    return [{ id, title, text }];
  });
}

/**
 * @param {Array<{ id?: string; title?: string; excerpt?: string; content?: string }>} sources
 * @param {number} maxChars
 */
export function formatSourcesForPrompt(sources, maxChars = DEFAULT_MAX_CHARS) {
  const registry = buildSourceRegistry(sources);
  if (registry.length === 0) return '';

  let used = 0;
  const blocks = [];

  for (const source of registry) {
    const header = `--- SOURCE [${source.id}]: ${source.title} ---\n`;
    const remaining = maxChars - used - header.length - 2;
    if (remaining <= 200) break;

    const slice = source.text.length > remaining
      ? `${source.text.slice(0, remaining)}\n[truncated]`
      : source.text;
    blocks.push(`${header}${slice}`);
    used += header.length + slice.length + 2;
  }

  return blocks.join('\n\n');
}

/**
 * Resolve model-produced citations against the exact sources included in the request.
 *
 * @param {string} answer
 * @param {Array<{ id?: string; title?: string; excerpt?: string; content?: string }>} sources
 */
export function validateSourceCitations(answer, sources) {
  const registry = buildSourceRegistry(sources);
  if (registry.length === 0) {
    return { status: 'not-grounded', citations: [], invalidCitations: [], sources: [] };
  }

  const knownSources = new Map(registry.map(({ id, title, text }) => [id, {
    id,
    title,
    excerpt: text.slice(0, 320),
  }]));
  const citedIds = [];
  const citationPattern = /\[Source:\s*([^\]\r\n]+)\]/gi;
  let match;
  while ((match = citationPattern.exec(typeof answer === 'string' ? answer : '')) !== null) {
    const id = normalizeSourceId(match[1], 0);
    if (!citedIds.includes(id)) citedIds.push(id);
  }

  const invalidCitations = citedIds.filter((id) => !knownSources.has(id));
  const citations = citedIds.flatMap((id) => {
    const source = knownSources.get(id);
    return source ? [source] : [];
  });
  const status = invalidCitations.length > 0
    ? 'invalid'
    : citations.length === 0
      ? 'missing'
      : 'verified';

  return {
    status,
    citations,
    invalidCitations,
    sources: [...knownSources.values()],
  };
}

/**
 * Resolve source IDs carried by structured generated items such as quiz questions.
 *
 * @param {unknown} sourceIds
 * @param {Array<{ id?: string; title?: string; excerpt?: string; content?: string }>} sources
 */
export function validateStructuredSourceIds(sourceIds, sources) {
  const registry = buildSourceRegistry(sources);
  if (registry.length === 0) {
    return { status: 'not-grounded', citations: [], invalidCitations: [], sources: [] };
  }
  const knownSources = new Map(registry.map(({ id, title, text }) => [id, {
    id,
    title,
    excerpt: text.slice(0, 320),
  }]));
  const citedIds = Array.isArray(sourceIds)
    ? [...new Set(sourceIds.filter((id) => typeof id === 'string').map((id) => normalizeSourceId(id, 0)))]
    : [];
  const invalidCitations = citedIds.filter((id) => !knownSources.has(id));
  const citations = citedIds.flatMap((id) => {
    const source = knownSources.get(id);
    return source ? [source] : [];
  });
  return {
    status: invalidCitations.length ? 'invalid' : citations.length ? 'verified' : 'missing',
    citations,
    invalidCitations,
    sources: [...knownSources.values()],
  };
}

export const GROUNDED_CHAT_RULES = `
GROUNDED MODE — the student attached study sources below.
- Prefer answers grounded in the sources; cite factual claims as [Source: id], using only the ID shown in each source header.
- If a question cannot be answered from the sources, say so clearly, then offer a brief general study hint.
- Do not invent facts, quotes, or citations not present in the sources.
- Keep the Socratic, exam-focused tone.`;

export const NOTEBOOK_OUTPUT_MODES = {
  'study-guide': {
    label: 'Study Guide',
    instruction: `Create a comprehensive study guide from the sources. Structure with:
1. Key concepts (bullet points)
2. Definitions and formulas
3. Common exam traps / misconceptions
4. Practice questions (3-5) with brief mark-scheme hints
Use clear markdown headings. Be exam-focused.`,
  },
  briefing: {
    label: 'Briefing Doc',
    instruction: `Write a concise executive briefing (400-700 words) summarizing the essential takeaways from all sources.
Include: main thesis, 5-7 key points, one paragraph on what to focus for exams.
Use markdown with ## headings.`,
  },
  faq: {
    label: 'FAQ',
    instruction: `Generate 8-12 FAQ pairs students would ask before an exam.
Return markdown with ### Question / Answer blocks. Ground every answer in the sources.`,
  },
  'audio-script': {
    label: 'Audio Overview Script',
    instruction: `Write a podcast-style "Audio Overview" script (~800-1200 words) with two hosts (Alex and Sam).
Format as dialogue:
**Alex:** ...
**Sam:** ...
Cover the most important ideas, disagreements worth exploring, and exam tips. Make it engaging to listen to.`,
  },
  timeline: {
    label: 'Timeline',
    instruction: `Extract a chronological or logical timeline of events/concepts from the sources.
Return markdown: each entry as **Date/Step** — description (1-2 sentences). Order from foundational to advanced.`,
  },
  flashcards: {
    label: 'Flashcard Deck',
    instruction: `Create 12-16 flashcards from the sources.
Return ONLY valid JSON: { "flashcards": [ { "front": "...", "back": "...", "sourceIds": ["exact-source-id"] } ] }
Every card must include at least one exact source ID from a SOURCE header.`,
    json: true,
    flashcards: true,
  },
  quiz: {
    label: 'Practice Quiz',
    instruction: `Create an exam-style practice quiz from the sources.
Return ONLY valid JSON: {
  "questions": [
    { "question": "...", "type": "mcq|short", "options": ["A","B","C","D"], "answer": "...", "explanation": "...", "marks": 2, "sourceIds": ["exact-source-id"] }
  ]
}
Include 8-10 questions mixing MCQ and short answer. Ground every question in the sources and include at least one exact source ID from a SOURCE header.`,
    json: true,
    quiz: true,
  },
  glossary: {
    label: 'Key Terms Glossary',
    instruction: `Extract 15-25 key terms, formulas, or named concepts from the sources.
Return markdown table:
| Term | Definition | Exam tip |
Ground every entry in the sources. Sort alphabetically.`,
  },
  outline: {
    label: 'Structured Outline',
    instruction: `Create a hierarchical outline (table of contents) of all source material.
Use markdown: # for units, ## for sections, ### for subsections, with 1-line summaries.
Show how topics connect for revision planning.`,
  },
  'mind-map': {
    label: 'Concept Map',
    instruction: `Create a concept map as a Mermaid flowchart showing how ideas in the sources connect.
Return a \`\`\`mermaid code block only, beginning with flowchart TD.
Use only declarations such as A["Cell"] and separate edges such as A -->|contains| B.
Use alphanumeric node IDs, short plain-text labels, at most 20 nodes and 40 edges.
Do not use HTML, styling, click handlers, subgraphs, or other Mermaid syntax. Label edges with relationship verbs.`,
  },
  compare: {
    label: 'Source Compare',
    instruction: `Compare and contrast information across the different sources.
Return markdown with:
## Agreements (what sources align on)
## Tensions (where sources differ or complement)
## Gaps (what's missing)
## Synthesis (one paragraph for exam essays)`,
  },
  'suggested-questions': {
    label: 'Suggested Questions',
    instruction: `Generate 10 insightful questions a student should ask to master this material before an exam.
Return ONLY valid JSON: { "questions": [ "...", "..." ] }
Mix factual, analytical, and "explain why" questions.`,
    json: true,
    questions: true,
  },
  'audio-brief': {
    label: 'Audio Brief',
    instruction: `Write a single-speaker "Brief" audio script (~250-350 words, under 2 minutes when read aloud).
Format:
**Host:** ...
Cover only the essential takeaways. Conversational but tight.`,
  },
  'audio-critique': {
    label: 'Audio Critique',
    instruction: `Write a "Critique" audio script with two hosts (Alex and Sam) constructively evaluating the arguments/quality in the sources (~600-900 words).
**Alex:** ...
**Sam:** ...
Focus on strengths, weaknesses, and how to improve exam answers.`,
  },
  'audio-debate': {
    label: 'Audio Debate',
    instruction: `Write a "Debate" audio script with two hosts (Alex and Sam) taking structured opposing views on the central tension in the sources (~700-1000 words).
**Alex:** ...
**Sam:** ...
End with what an examiner would want in a balanced conclusion.`,
  },
  'board-deep-dive': {
    label: 'Board Deep Dive',
    instruction: `Write an in-depth board-specific study resource (minimum 1000 words) from the sources.
Include: board paper/criteria structure, command-term usage, topic breakdown, mark-scheme thinking, common mistakes, revision schedule, and practice strategy.
Use ## and ### headings. Original synthesis — not copied textbook text.
End with "Quick wins this week" — 5 actionable bullets.`,
  },
};
