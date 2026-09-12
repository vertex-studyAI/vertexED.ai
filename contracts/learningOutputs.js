import { z } from 'zod';

const text = (max) => z.string().trim().min(1).max(max);
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
  })).min(1).max(12) }).safeParse(value);
  return z.object({ flashcards: z.array(z.object({ front: text(300), back: text(1_000), sourceIds: z.array(text(160)).min(1).max(12) })).min(1).max(20) }).safeParse(value);
}
