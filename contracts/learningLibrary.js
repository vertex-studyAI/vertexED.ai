import { z } from 'zod';

const text = max => z.string().trim().min(1).max(max);
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const distinct = values => new Set(values.map(value => value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim())).size === values.length;
// Case is meaningful in scientific notation (Aa, AA and aa are different genotypes).
const distinctOptions = values => new Set(values.map(value => value.normalize('NFKC').replace(/\s+/g, ' ').trim())).size === values.length;
const difficulty = z.enum(['foundation', 'standard', 'extension']);
const question = z.object({
  id, type: z.enum(['mcq', 'short', 'calculation', 'extended']), difficulty,
  prompt: text(4000), options: z.array(text(1000)).min(2).max(6).optional(), answer: text(4000),
  solution: z.array(text(2500)).min(2).max(12),
  markingPoints: z.array(text(1000)).min(1).max(12), marks: z.number().int().positive().max(12),
  calculator: z.enum(['not-required', 'allowed', 'not-applicable']),
  numericAnswer: z.object({ value: z.number().finite(), tolerance: z.number().min(0).max(0.01) }).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.marks !== value.markingPoints.length) ctx.addIssue({ code: 'custom', message: 'Each marking point earns one practice mark.' });
  if (value.type === 'mcq' && (!value.options || !distinctOptions(value.options) || !value.options.includes(value.answer))) ctx.addIssue({ code: 'custom', message: 'MCQ options must be distinct and contain the exact answer.' });
  if (value.type !== 'mcq' && value.options) ctx.addIssue({ code: 'custom', message: 'Options belong only to MCQs.' });
});

// Separate authored extensions keep historical lesson sources intact. The merged
// lesson is validated again, including references and cross-pack uniqueness.
export const foundationDepthSchema = z.object({
  schemaVersion: z.literal(1), lessonId: id, revision: text(80),
  notes: z.array(z.object({ heading: text(160), paragraphs: z.array(text(5000)).min(1).max(6) }).strict()).min(1).max(3),
  questions: z.array(question).min(3),
}).strict();

export const learningLessonSchema = z.object({
  schemaVersion: z.literal(1), id, revision: text(80), subject: text(120), unit: text(160), topic: text(160),
  level: z.enum(['secondary-foundation', 'secondary-extension', 'introductory-university']),
  editorialStatus: z.literal('unreviewed'), origin: z.literal('original-authorship-review-pending'),
  scope: text(1500), prerequisites: z.array(text(400)).min(2), objectives: z.array(text(400)).min(3),
  syllabusMappings: z.array(z.object({
    sourceId: id, point: text(180), tier: text(160), status: z.literal('source-checked-partial'),
    noteHeadings: z.array(text(160)).min(1), questionIds: z.array(id).min(1),
    remaining: z.array(text(600)).min(1),
  }).strict()).max(20).optional(),
  notes: z.array(z.object({ heading: text(160), paragraphs: z.array(text(5000)).min(1).max(6) }).strict()).min(3).max(12),
  workedExamples: z.array(z.object({ prompt: text(2500), steps: z.array(text(2000)).min(2), answer: text(2000) }).strict()).min(2),
  misconceptions: z.array(z.object({ claim: text(1000), correction: text(2000) }).strict()).min(2),
  flashcards: z.array(z.object({ id, front: text(500), back: text(1500) }).strict()).min(5),
  questions: z.array(question).min(4),
  revisionChecklist: z.array(text(600)).min(3),
  diagrams: z.array(z.object({
    id, title: text(160), description: text(800),
    steps: z.array(z.object({ label: text(80), detail: text(500) }).strict()).min(2).max(8),
    links: z.array(text(100)).min(1).max(7),
  }).strict()).max(6).optional(),
  teachingSequence: z.array(z.object({
    title: text(160), guidance: text(1200), noteHeadings: z.array(text(160)).min(1),
    workedExampleNumbers: z.array(z.number().int().positive()).min(1), questionIds: z.array(id).min(1),
  }).strict()).min(3).max(8).optional(),
  revisionGuide: z.object({
    summary: text(1600), keyIdeas: z.array(text(700)).min(3).max(10),
    formulas: z.array(z.object({ expression: text(300), meaning: text(700), conditions: text(700) }).strict()).max(8),
    recallPrompts: z.array(text(600)).min(3).max(10), practiceQuestionIds: z.array(id).min(3),
    revisit: text(800),
  }).strict().optional(),
}).strict().superRefine((value, ctx) => {
  const words = value.notes.flatMap(section => section.paragraphs).join(' ').split(/\s+/).length;
  if (words < 220) ctx.addIssue({ code: 'custom', message: 'Lesson notes need at least 220 substantive words, excluding questions and metadata.' });
  for (const [label, values] of [
    ['headings', value.notes.map(item => item.heading)], ['card prompts', value.flashcards.map(item => item.front)],
    ['question prompts', value.questions.map(item => item.prompt)], ['question ids', value.questions.map(item => item.id)],
    ['card ids', value.flashcards.map(item => item.id)],
  ]) if (!distinct(values)) ctx.addIssue({ code: 'custom', message: `Duplicate ${label}.` });
  const mappings = value.syllabusMappings ?? [];
  if (!distinct((value.diagrams ?? []).map(diagram => diagram.id))) ctx.addIssue({ code: 'custom', message: 'Duplicate diagram identity.' });
  for (const diagram of value.diagrams ?? []) {
    if (diagram.links.length !== diagram.steps.length - 1) ctx.addIssue({ code: 'custom', message: 'Each adjacent diagram step needs exactly one labelled relationship.' });
    if (!distinct(diagram.steps.map(step => step.label))) ctx.addIssue({ code: 'custom', message: 'Duplicate diagram step label.' });
  }
  for (const step of value.teachingSequence ?? []) {
    if (!distinct(step.noteHeadings) || !distinct(step.questionIds) || new Set(step.workedExampleNumbers).size !== step.workedExampleNumbers.length ||
      !step.noteHeadings.every(heading => value.notes.some(note => note.heading === heading)) ||
      !step.questionIds.every(id => value.questions.some(question => question.id === id)) ||
      !step.workedExampleNumbers.every(number => number <= value.workedExamples.length)) {
      ctx.addIssue({ code: 'custom', message: 'Teaching sequence must reference distinct existing notes, examples and questions.' });
    }
  }
  if (value.revisionGuide && (!distinct(value.revisionGuide.practiceQuestionIds) ||
    !value.revisionGuide.practiceQuestionIds.every(id => value.questions.some(question => question.id === id)))) {
    ctx.addIssue({ code: 'custom', message: 'Revision guide must reference distinct existing questions.' });
  }
  if (!distinct(mappings.map(mapping => `${mapping.sourceId}:${mapping.point}`))) ctx.addIssue({ code: 'custom', message: 'Duplicate syllabus mapping.' });
  for (const mapping of mappings) {
    if (!distinct(mapping.noteHeadings) || !distinct(mapping.questionIds)) ctx.addIssue({ code: 'custom', message: 'Duplicate mapping evidence reference.' });
    if (!mapping.noteHeadings.every(heading => value.notes.some(note => note.heading === heading)) ||
      !mapping.questionIds.every(id => value.questions.some(question => question.id === id))) {
      ctx.addIssue({ code: 'custom', message: 'Syllabus mapping must reference existing teaching sections and questions.' });
    }
  }
});

/** Reviewer export; no publication approval is inferred from this rendering. */
export function renderLearningLesson(lesson, sources = []) {
  const sections = [`# ${lesson.topic}`, `Subject: ${lesson.subject} · Unit: ${lesson.unit} · Revision: ${lesson.revision}`,
    '**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**', lesson.scope,
    '## Prerequisites', ...lesson.prerequisites.map(item => `- ${item}`), '## Objectives', ...lesson.objectives.map(item => `- ${item}`)];
  for (const section of lesson.notes) sections.push(`## ${section.heading}`, ...section.paragraphs);
  for (const diagram of lesson.diagrams ?? []) sections.push(`## Diagram: ${diagram.title}`, diagram.description,
    ...diagram.steps.map((step, i) => `${i + 1}. ${step.label}: ${step.detail}${diagram.links[i] ? `\n   Relationship to next step: ${diagram.links[i]}` : ''}`));
  if (lesson.teachingSequence) {
    sections.push('## Guided teaching sequence', 'Suggested study route, not an official assessment or measured mastery.');
    for (const step of lesson.teachingSequence) sections.push(`### ${step.title}`, step.guidance,
      `Read: ${step.noteHeadings.join('; ')}`, `Worked examples: ${step.workedExampleNumbers.join(', ')}`, `Practise: ${step.questionIds.join(', ')}`);
  }
  lesson.workedExamples.forEach((example, i) => sections.push(`## Worked example ${i + 1}`, example.prompt, ...example.steps.map((step, j) => `${j + 1}. ${step}`), `Answer: ${example.answer}`));
  sections.push('## Misconceptions', ...lesson.misconceptions.map(item => `- ${item.claim}\n  Correction: ${item.correction}`));
  sections.push('## Flashcards', ...lesson.flashcards.map(card => `### ${card.front}\n${card.back}`));
  lesson.questions.forEach((q, i) => sections.push(`## Practice ${i + 1} — ${q.difficulty} · ${q.marks} marks`, q.prompt,
    ...(q.options ?? []).map((option, j) => `${String.fromCharCode(65 + j)}. ${option}`), `Answer: ${q.answer}`,
    ...q.solution.map((step, j) => `${j + 1}. ${step}`), 'Marking points (one practice mark each):', ...q.markingPoints.map(point => `- ${point}`)));
  sections.push('## Revision checklist', ...lesson.revisionChecklist.map(item => `- ${item}`));
  if (lesson.revisionGuide) {
    const guide = lesson.revisionGuide;
    sections.push('## Revision guide', guide.summary, '### Key ideas', ...guide.keyIdeas.map(item => `- ${item}`),
      ...guide.formulas.map(formula => `### ${formula.expression}\n${formula.meaning}\nConditions: ${formula.conditions}`),
      '### Retrieve without looking', ...guide.recallPrompts.map(item => `- ${item}`),
      `Mixed practice: ${guide.practiceQuestionIds.join(', ')}`, guide.revisit);
  }
  if (lesson.syllabusMappings?.length) {
    sections.push('## Partial syllabus crosswalk', 'Source-checked means the official point was inspected, not independently approved teaching or complete coverage.');
    for (const mapping of lesson.syllabusMappings) {
      const source = sources.find(item => item.id === mapping.sourceId && item.points.includes(mapping.point));
      if (!source) throw new Error(`Missing inspected source for export: ${mapping.sourceId}/${mapping.point}`);
      sections.push(`### ${mapping.sourceId}: ${mapping.point}`, `[Official specification reference](${source.url})`,
      `Version: ${source.version}. Checked: ${source.checkedOn}. Location: ${source.locator}.`, `Tier/scope: ${mapping.tier}`,
      `Teaching: ${mapping.noteHeadings.join('; ')}`, `Practice IDs: ${mapping.questionIds.join(', ')}`,
      'Still required:', ...mapping.remaining.map(item => `- ${item}`));
    }
  }
  return `${sections.join('\n\n')}\n`;
}
