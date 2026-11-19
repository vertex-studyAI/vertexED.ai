// Original prose and assessment are authored in the subject modules. This file
// expands their compact structures, without generating teaching or awarding review.
export { note, example } from '../syllabus-lessons/authoring.mjs';
export const labels = {
  B: 'GCSE Foundation/Higher; IGCSE Core/Extended',
  GE: 'GCSE Foundation/Higher; IGCSE Extended only',
  G: 'GCSE Foundation/Higher', H: 'GCSE Higher only',
  C: 'IGCSE Core/Extended', E: 'IGCSE Extended only',
  U: 'GCSE/IGCSE: untiered', GU: 'GCSE: untiered', CU: 'IGCSE: untiered',
  A: 'A-Level: untiered',
};
export function question(id, tier, prompt, answer, solution, markingPoints, calculator = 'not-applicable') {
  if (!labels[tier]) throw new Error(`Unknown subject-unit tier: ${tier}`);
  return { id, type: 'extended', difficulty: ['H','E','A'].includes(tier) ? 'extension' : 'standard',
    prompt: `[${labels[tier]}] ${prompt}`, answer, solution, markingPoints,
    marks: markingPoints.length, calculator };
}
export function lesson({ id, subject, unit, topic, scope, prerequisites, objectives, notes, examples,
  misconceptions, cards, questions, summary, advanced = false }) {
  return { schemaVersion: 1, id: `unit-${id}`, revision: '2026-10-22.1', subject, unit, topic,
    level: advanced ? 'secondary-extension' : 'secondary-foundation',
    editorialStatus: 'unreviewed', origin: 'original-authorship-review-pending',
    scope: `${scope} Original teaching and practice, not official examination material. Practice rubrics are for self-review. This topic does not establish whole-course coverage, independent subject review or publication approval.`,
    prerequisites, objectives, notes, workedExamples: examples,
    misconceptions: misconceptions.map(([claim, correction]) => ({ claim, correction })),
    flashcards: cards.map(([front, back], index) => ({ id: `recall-${index + 1}`, front, back })), questions,
    revisionChecklist: objectives,
    teachingSequence: [
      { title: 'Build the explanation', guidance: 'Read the opening sections. Reconstruct the reasoning in worked example 1, then attempt the first two questions before looking at their answers.',
        noteHeadings: notes.slice(0,2).map(n => n.heading), workedExampleNumbers: [1], questionIds: questions.slice(0,2).map(q => q.id) },
      { title: 'Apply and distinguish', guidance: 'Study the remaining sections and worked example 2. Explain why its reasoning fits this situation. Check the programme and tier labels before attempting the next questions.',
        noteHeadings: notes.slice(2).map(n => n.heading), workedExampleNumbers: [2], questionIds: questions.slice(2,4).map(q => q.id) },
      { title: 'Test and revise', guidance: 'Attempt the remaining questions from memory. Compare each claim with the practice marking points, correcting unsupported reasoning. These are self-review tasks, not automated exam grades.',
        noteHeadings: notes.map(n => n.heading), workedExampleNumbers: [1,2], questionIds: questions.slice(4).map(q => q.id) },
    ],
    revisionGuide: { summary, keyIdeas: cards.map(([front,back]) => `${front} ${back}`), formulas: [],
      recallPrompts: cards.map(([front]) => front), practiceQuestionIds: questions.map(q => q.id),
      revisit: 'Explain your corrected answers without the notes. Revisit the specific section responsible for each error; completing these questions is not evidence of completing the qualification.' },
  };
}
