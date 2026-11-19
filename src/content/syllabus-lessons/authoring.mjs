// Original teaching source. Compact tuples are expanded into the same strict
// lesson contract as the existing reader; they are not generated lesson prose.
export const tierLabels = {
  B: 'GCSE Foundation/Higher; IGCSE Core/Extended',
  H: 'GCSE Higher; IGCSE Extended',
  G: 'GCSE Foundation/Higher',
  GH: 'GCSE Higher',
  C: 'IGCSE Core/Extended',
  E: 'IGCSE Extended',
  A: 'A-Level',
};
export const note = (heading, ...paragraphs) => ({ heading, paragraphs });
export const example = (prompt, answer, ...steps) => ({ prompt, answer, steps });
export function question(id, tier, prompt, answer, solution, markingPoints, calculator = 'not-required') {
  if (!tierLabels[tier]) throw new Error(`Unknown tier ${tier}`);
  return { id, type: 'extended', difficulty: ['H', 'GH', 'E', 'A'].includes(tier) ? 'extension' : 'standard',
    prompt: `[${tierLabels[tier]}] ${prompt}`, answer, solution, markingPoints, marks: markingPoints.length, calculator };
}
export function lesson({ id, topic, scope, prerequisites, objectives, notes, examples, misconceptions, cards, questions, route, summary, formulas = [] }) {
  return { schemaVersion: 1, id: `syllabus-${id}`, revision: '2026-10-21.5', subject: 'Mathematics',
    unit: id === 'a-level-proof' ? 'AQA A-Level 7357: Proof' : 'AQA GCSE 8300 / Cambridge IGCSE 0580: Number',
    topic, level: id === 'a-level-proof' ? 'secondary-extension' : 'secondary-foundation',
    editorialStatus: 'unreviewed', origin: 'original-authorship-review-pending',
    scope: `${scope} Original teaching and practice, not official exam questions. Tier labels describe intended specification scope, not predicted grades. Author-proposed coverage is recorded separately from independent review and publication approval.`,
    prerequisites, objectives, notes, workedExamples: examples,
    misconceptions: misconceptions.map(([claim, correction]) => ({ claim, correction })),
    flashcards: cards.map(([front, back], index) => ({ id: `recall-${index + 1}`, front, back })), questions,
    revisionChecklist: objectives,
    teachingSequence: route.map(([title, guidance, noteNumbers, workedExampleNumbers, questionIds]) => ({ title, guidance, noteHeadings: noteNumbers.map(n => notes[n - 1].heading), workedExampleNumbers, questionIds })),
    revisionGuide: { summary, keyIdeas: cards.slice(0, 5).map(([front, back]) => `${front} ${back}`), formulas,
      recallPrompts: cards.slice(0, 5).map(([front]) => front), practiceQuestionIds: questions.map(q => q.id),
      revisit: 'Reattempt the questions without the notes. Use the worked reasoning to identify the first unsupported step, then explain that step in your own words. Editorial self-review marks do not certify exam readiness.' },
  };
}
