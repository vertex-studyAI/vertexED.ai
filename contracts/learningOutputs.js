import { z } from 'zod';

const text = (max) => z.string().trim().min(1).max(max);
const uniqueText = items => new Set(items.map(value => value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim())).size === items.length;

const lessonSchema = z.object({
  title: text(160), difficulty: z.enum(['foundation', 'standard', 'extension']),
  objectives: z.array(text(300)).min(1).max(8),
  sections: z.array(z.object({ heading: text(160), explanation: text(6000), sourceIds: z.array(text(160)).min(1).max(12) })).min(2).max(10),
  workedExamples: z.array(z.object({ prompt: text(2000), steps: z.array(text(1500)).min(2).max(12), answer: text(2000), sourceIds: z.array(text(160)).min(1).max(12) })).min(1).max(5),
  misconceptions: z.array(z.object({ misconception: text(1000), correction: text(2000), sourceIds: z.array(text(160)).min(1).max(12) })).min(1).max(8),
  summary: z.array(text(500)).min(1).max(8), limitations: text(2000),
}).superRefine((value, ctx) => {
  if (!uniqueText(value.sections.map(section => section.heading)) || !uniqueText(value.workedExamples.map(example => example.prompt))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Lesson sections and examples must be distinct.' });
  }
});

export function lessonMarkdown(lesson) {
  const cite = ids => ids.map(id => `[Source: ${id}]`).join(' ');
  return [`# ${lesson.title}`, `Difficulty: ${lesson.difficulty}`, '## Learning objectives', ...lesson.objectives.map(item => `- ${item}`),
    ...lesson.sections.map(item => `## ${item.heading}\n${item.explanation}\n${cite(item.sourceIds)}`),
    ...lesson.workedExamples.map((item, index) => `## Worked example ${index + 1}\n${item.prompt}\n\n${item.steps.map((step, n) => `${n + 1}. ${step}`).join('\n')}\n\nAnswer: ${item.answer}\n${cite(item.sourceIds)}`),
    '## Common misconceptions', ...lesson.misconceptions.map(item => `### ${item.misconception}\n${item.correction}\n${cite(item.sourceIds)}`),
    '## Summary', ...lesson.summary.map(item => `- ${item}`), '## Scope and missing material', lesson.limitations].join('\n\n');
}
const question = z.object({
  id: text(100), type: z.enum(['multiple_choice', 'frq', 'interactive']),
  prompt: text(10_000), answer: text(5_000), maxScore: z.number().int().min(1).max(100),
  choices: z.array(text(1_000)).min(2).max(5).optional(),
  objectiveIds: z.array(text(120)).max(12).optional(),
}).superRefine((value, ctx) => {
  if (value.type === 'multiple_choice' && (!value.choices?.includes(value.answer) || new Set(value.choices).size !== value.choices?.length)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Multiple-choice answers require distinct choices containing the answer.' });
  }
});

export function validateGeneratedQuiz(value, counts, optionCount) {
  const parsed = z.object({ questions: z.array(question).min(1).max(50) }).safeParse(value);
  if (!parsed.success) return null;
  const questions = parsed.data.questions;
  if (new Set(questions.map(q => q.id)).size !== questions.length) return null;
  for (const [type, count] of Object.entries({ multiple_choice: counts.mcq, frq: counts.frq, interactive: counts.interactive })) {
    if (questions.filter(q => q.type === type).length !== count) return null;
  }
  if (questions.some(q => q.type === 'multiple_choice' && q.choices.length !== optionCount)) return null;
  return questions;
}

export function validateNotebookOutput(mode, value) {
  if (mode === 'lesson') return lessonSchema.safeParse(value);
  if (mode === 'suggested-questions') return z.object({ questions: z.array(text(1_000)).min(1).max(15) }).safeParse(value);
  if (mode === 'quiz') return z.object({ questions: z.array(z.object({
    question: text(1_000), type: z.enum(['mcq', 'short']),
    options: z.array(text(300)).max(6).default([]), answer: text(1_000),
    explanation: z.string().max(2_000).default(''), marks: z.number().int().min(1).max(100).default(1),
    sourceIds: z.array(text(160)).min(1).max(12),
  }).superRefine((q, ctx) => {
    if (q.type === 'mcq' && (q.options.length < 2 || new Set(q.options).size !== q.options.length || !q.options.includes(q.answer))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Quiz answer must match a distinct option.' });
    }
  })).min(1).max(12).refine(items => uniqueText(items.map(item => item.question)), 'Duplicate quiz questions are not allowed.') }).safeParse(value);
  return z.object({ flashcards: z.array(z.object({ front: text(300), back: text(1_000), sourceIds: z.array(text(160)).min(1).max(12) })).min(1).max(20)
    .refine(items => uniqueText(items.map(item => item.front)), 'Duplicate card prompts are not allowed.') }).safeParse(value);
}
