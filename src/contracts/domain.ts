import { z } from 'zod';
import {
  STUDY_ARTIFACT_KINDS,
  type StudyArtifactKind,
} from '../../contracts/studyArtifact.js';

const isoTimestamp = z.string().datetime({ offset: true });
const identifier = z.string().uuid();

export const ExamBoardSchema = z.enum([
  'IB_MYP',
  'IB_DP',
  'IGCSE',
  'GCSE',
  'A_LEVELS',
  'AP',
  'CBSE',
  'ICSE',
]);

export const UserProfileSchema = z.object({
  id: identifier,
  email: z.string().email().nullable(),
  full_name: z.string().trim().min(1).max(160).nullable(),
  avatar_url: z.string().url().nullable(),
  board: ExamBoardSchema.nullable().optional(),
  grade: z.number().int().min(1).max(13).nullable().optional(),
  subjects: z.array(z.string().trim().min(1).max(120)).max(24).nullable().optional(),
  exam_date: z.string().date().nullable().optional(),
  created_at: isoTimestamp,
  updated_at: isoTimestamp,
}).strict();

export const CourseSubjectSchema = z.object({
  board: ExamBoardSchema,
  grade: z.number().int().min(1).max(13),
  subject: z.string().trim().min(1).max(120),
  course_code: z.string().trim().min(1).max(80).nullable().optional(),
}).strict();

export const EvidenceReferenceSchema = z.object({
  id: z.string().trim().min(1).max(160),
  source_type: z.enum(['user_input', 'mark_scheme', 'course_material', 'model_output']),
  locator: z.string().trim().min(1).max(500),
  excerpt: z.string().trim().max(2_000).nullable().optional(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/).nullable().optional(),
}).strict();

export const MockQuestionSchema = z.object({
  id: z.string().trim().min(1).max(160),
  prompt: z.string().trim().min(1).max(20_000),
  marks: z.number().int().positive().max(100),
  command_terms: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  evidence: z.array(EvidenceReferenceSchema).max(50).default([]),
}).strict();

export const MockSchema = z.object({
  id: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(200),
  course: CourseSubjectSchema,
  duration_minutes: z.number().int().positive().max(360),
  questions: z.array(MockQuestionSchema).min(1).max(200),
  created_at: isoTimestamp,
}).strict();

export const StudentResponseSchema = z.object({
  question_id: z.string().trim().min(1).max(160),
  text: z.string().max(50_000),
  attachment_ids: z.array(z.string().trim().min(1).max(160)).max(20).default([]),
  submitted_at: isoTimestamp,
}).strict();

export const RubricCriterionFeedbackSchema = z.object({
  criterion: z.string().trim().min(1).max(200),
  awarded: z.number().min(0),
  available: z.number().positive(),
  rationale: z.string().trim().min(1).max(5_000),
  evidence_ids: z.array(z.string().trim().min(1).max(160)).max(50).default([]),
}).strict().refine((value) => value.awarded <= value.available, {
  message: 'Awarded marks cannot exceed available marks.',
  path: ['awarded'],
});

export const RubricFeedbackSchema = z.object({
  response_id: z.string().trim().min(1).max(160),
  criteria: z.array(RubricCriterionFeedbackSchema).min(1).max(100),
  total_awarded: z.number().min(0),
  total_available: z.number().positive(),
  next_actions: z.array(z.string().trim().min(1).max(500)).max(20),
  evidence: z.array(EvidenceReferenceSchema).max(100).default([]),
}).strict().refine((value) => value.total_awarded <= value.total_available, {
  message: 'Total awarded marks cannot exceed total available marks.',
  path: ['total_awarded'],
});

export const NoteSchema = z.object({
  id: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(120),
  markdown: z.string().max(200_000),
  source_evidence: z.array(EvidenceReferenceSchema).max(100).default([]),
  updated_at: isoTimestamp,
}).strict();

export const StudyPlanTaskSchema = z.object({
  id: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(120).nullable().optional(),
  starts_at: isoTimestamp,
  duration_minutes: z.number().int().positive().max(480),
  status: z.enum(['planned', 'in_progress', 'completed', 'skipped']),
}).strict();

export const StudyPlanSchema = z.object({
  id: z.string().trim().min(1).max(160),
  mode: z.enum(['Day', 'Week', 'Month']),
  tasks: z.array(StudyPlanTaskSchema).max(1_000),
  updated_at: isoTimestamp,
}).strict();

export const AiRunMetadataSchema = z.object({
  run_id: z.string().trim().min(1).max(160),
  feature: z.enum(['chat', 'note', 'quiz', 'paper', 'review', 'planner']),
  provider: z.string().trim().min(1).max(120),
  model: z.string().trim().min(1).max(240),
  prompt_version: z.string().trim().min(1).max(120),
  status: z.enum(['succeeded', 'failed', 'aborted']),
  started_at: isoTimestamp,
  completed_at: isoTimestamp.nullable(),
  evidence_ids: z.array(z.string().trim().min(1).max(160)).max(100).default([]),
  input_tokens: z.number().int().nonnegative().nullable().optional(),
  output_tokens: z.number().int().nonnegative().nullable().optional(),
  error_code: z.string().trim().min(1).max(160).nullable().optional(),
}).strict();

export const StudyArtifactKindSchema = z.enum(STUDY_ARTIFACT_KINDS);

export const StudyArtifactRowSchema = z.object({
  id: identifier,
  kind: StudyArtifactKindSchema,
  title: z.string().max(200).nullable(),
  payload: z.record(z.string(), z.unknown()),
  created_at: isoTimestamp,
  updated_at: isoTimestamp,
}).strict();

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type CourseSubject = z.infer<typeof CourseSubjectSchema>;
export type Mock = z.infer<typeof MockSchema>;
export type StudentResponse = z.infer<typeof StudentResponseSchema>;
export type RubricFeedback = z.infer<typeof RubricFeedbackSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type StudyPlan = z.infer<typeof StudyPlanSchema>;
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;
export type AiRunMetadata = z.infer<typeof AiRunMetadataSchema>;
export type StudyArtifactRow = z.infer<typeof StudyArtifactRowSchema>;
export type { StudyArtifactKind };
