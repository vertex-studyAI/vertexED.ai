/**
 * Shared source-grounding helpers for Apex chat and notebook generation.
 */

const DEFAULT_MAX_CHARS = 80_000;

/**
 * @param {Array<{ id?: string; title?: string; excerpt?: string; content?: string }>} sources
 * @param {number} maxChars
 */
export function formatSourcesForPrompt(sources, maxChars = DEFAULT_MAX_CHARS) {
  if (!Array.isArray(sources) || sources.length === 0) return '';

  let used = 0;
  const blocks = [];

  for (const source of sources) {
    const title =
      typeof source.title === 'string' && source.title.trim()
        ? source.title.trim().slice(0, 120)
        : 'Untitled source';
    const text = (
      typeof source.excerpt === 'string'
        ? source.excerpt
        : typeof source.content === 'string'
          ? source.content
          : ''
    ).trim();

    if (!text) continue;

    const header = `--- SOURCE: ${title} ---\n`;
    const remaining = maxChars - used - header.length - 2;
    if (remaining <= 200) break;

    const slice = text.length > remaining ? `${text.slice(0, remaining)}\n[truncated]` : text;
    blocks.push(`${header}${slice}`);
    used += header.length + slice.length + 2;
  }

  return blocks.join('\n\n');
}

export const GROUNDED_CHAT_RULES = `
GROUNDED MODE — the student attached study sources below.
- Prefer answers grounded in the sources; cite as [Source: title].
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
Return ONLY valid JSON: { "flashcards": [ { "front": "...", "back": "..." } ] }`,
    json: true,
    flashcards: true,
  },
  quiz: {
    label: 'Practice Quiz',
    instruction: `Create an exam-style practice quiz from the sources.
Return ONLY valid JSON: {
  "questions": [
    { "question": "...", "type": "mcq|short", "options": ["A","B","C","D"], "answer": "...", "explanation": "...", "marks": 2 }
  ]
}
Include 8-10 questions mixing MCQ and short answer. Ground every question in the sources.`,
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
Return markdown with a \`\`\`mermaid code block only (flowchart TD or mindmap).
Max 20 nodes. Label edges with relationship verbs.`,
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
  'world-model': {
    label: 'World Model Map',
    instruction: `Build a "world model" learning map from the sources.
Return markdown with:
## Foundation layer (definitions & prerequisites)
## Core layer (main concepts with links between them)
## Exam layer (what examiners test and how marks are awarded)
## Weak links (gaps a student must fix)
## Mermaid concept graph (\`\`\`mermaid flowchart TD\`\`\` with max 18 nodes)
End with a 3-step retrieval plan for the next 48 hours.`,
  },
  'board-deep-dive': {
    label: 'Board Deep Dive',
    instruction: `Write an in-depth board-specific study resource (minimum 1000 words) from the sources.
Include: board paper/criteria structure, command-term usage, topic breakdown, mark-scheme thinking, common mistakes, revision schedule, and practice strategy.
Use ## and ### headings. Original synthesis — not copied textbook text.
End with "Quick wins this week" — 5 actionable bullets.`,
  },
};
