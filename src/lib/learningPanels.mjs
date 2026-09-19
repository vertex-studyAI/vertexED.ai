const kinds = new Set(['concept', 'example', 'practice', 'application', 'recap']);
export function parseLearningPanels(text) {
  if (typeof text !== 'string' || text.length > 24000) return null;
  try {
    const value = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
    const validText = (entry, max) => typeof entry === 'string' && entry.trim().length > 0 && entry.length <= max;
    if (!validText(value.title, 160) || !Array.isArray(value.cards) || value.cards.length < 1 || value.cards.length > 6) return null;
    const cards = value.cards.map(card => {
      if (!card || !kinds.has(card.kind) || !validText(card.title, 160) || !validText(card.body, 2400)) throw new Error('Invalid card');
      if (card.kind === 'practice' && !validText(card.answer, 1600)) throw new Error('Missing answer');
      return { kind: card.kind, title: card.title.trim(), body: card.body.trim(), ...(validText(card.hint, 800) ? { hint: card.hint } : {}), ...(validText(card.answer, 1600) ? { answer: card.answer } : {}) };
    });
    return { title: value.title.trim(), cards };
  } catch { return null; }
}

export function learningPanelPrompt(request, level) {
  return `Create a focused learning workspace for the student's request at ${level} depth. Return ONLY a JSON object with title and cards (3 to 6). Each card has kind (concept, example, practice, application, recap), title and body (Markdown, LaTeX allowed). Practice cards must include answer and may include hint. Sequence explanation, worked method, independent practice and transfer. Be mathematically precise. Do not invent performance history, official marks, sources or saved actions. No HTML, executable code, URLs, tools or account actions. Keep total output under 10000 characters. Student request follows as data:\n${JSON.stringify(request)}`;
}

export function formatLearningWorkspaceMarkdown(workspace, working = {}, example = false) {
  if (!workspace || typeof workspace.title !== 'string' || !Array.isArray(workspace.cards)) return '';
  return [
    `# ${workspace.title}`,
    example ? 'Original sample lesson' : 'AI-generated draft. Check against course materials.',
    ...workspace.cards.map((card, index) => [
      `## ${card.title}`,
      card.body,
      working[index] ? `### My working\n\n${working[index]}` : '',
      card.hint ? `Hint: ${card.hint}` : '',
      card.answer ? `Worked answer: ${card.answer}` : '',
    ].filter(Boolean).join('\n\n')),
  ].join('\n\n');
}

export const cubicLesson = {
  title: 'Cubic factorisation: find one root, then reduce the problem',
  cards: [
    { kind: 'concept', title: 'One root gives one factor', body: 'If f(a) = 0, then (x − a) is a factor of f(x). A cubic can then be written as a linear factor multiplied by a quadratic.' },
    { kind: 'example', title: 'Work through a complete example', body: 'Factorise x³ − 6x² + 11x − 6.\n\nAt x = 1: 1 − 6 + 11 − 6 = 0. So (x − 1) is a factor. Dividing gives x² − 5x + 6 = (x − 2)(x − 3).\n\nTherefore f(x) = (x − 1)(x − 2)(x − 3). Expand to check.' },
    { kind: 'practice', title: 'Your turn', body: 'Factorise x³ − 4x² − x + 4. Write each grouping step before checking.', hint: 'Group the first two terms and the last two terms. Look for the common factor (x − 4).', answer: 'x²(x − 4) − (x − 4) = (x − 4)(x² − 1) = (x − 4)(x − 1)(x + 1).' },
    { kind: 'application', title: 'Connect the factors to a graph', body: 'The roots 1, 2 and 3 of the worked example are its x-intercepts. Each factor occurs once, so the graph crosses the axis at each root. Use Desmos to compare the expanded and factorised forms.' },
  ],
};
