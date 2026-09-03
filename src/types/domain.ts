import type { ExamBoard } from '@/types/curriculum';
import type {
  AssessmentCoverage,
  LearningArtifactProvenance,
  VerifiedGradeAudit,
} from '@/types/learning';

export type IsoDateTime = string;
export type Uuid = string;

export type UserIdentity = {
  id: Uuid;
  email: string | null;
  providers: string[];
};

export type LearnerProfileContract = {
  userId: Uuid;
  displayName: string | null;
  board: ExamBoard | null;
  grade: number | null;
  subjects: string[];
  examDate: string | null;
  onboardingComplete: boolean;
  updatedAt: IsoDateTime;
};

export type CourseSubjectContract = {
  board: ExamBoard;
  subjectId: string;
  subjectName: string;
  syllabusVersion: string;
  objectiveIds: string[];
};

export type AssessmentQuestionContract = {
  id: string;
  type: 'multiple_choice' | 'frq' | 'interactive';
  prompt: string;
  choices?: string[];
  answerReference?: string;
  maxScore: number;
  objectiveIds: string[];
  provenance: LearningArtifactProvenance;
};

export type MockAssessmentContract = {
  id: Uuid | string;
  ownerId: Uuid;
  title: string;
  board: ExamBoard | 'Generic';
  subjects: string[];
  questions: AssessmentQuestionContract[];
  provenance: LearningArtifactProvenance;
  createdAt: IsoDateTime;
};

export type LearnerResponseContract = {
  assessmentId: Uuid | string;
  questionId: string;
  ownerId: Uuid;
  answer: string;
  submittedAt: IsoDateTime;
};

export type RubricFeedbackContract = {
  assessmentId: Uuid | string;
  ownerId: Uuid;
  grades: VerifiedGradeAudit[];
  coverage: AssessmentCoverage[];
  contractVersion: 'vertexed.grading.v1';
  recordedAt: IsoDateTime;
};

export type NoteContract = {
  id: Uuid | string;
  ownerId: Uuid;
  title: string;
  markdown: string;
  board: ExamBoard | 'Generic';
  subject: string;
  topic: string;
  provenance: LearningArtifactProvenance;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type StudyPlanItemContract = {
  id: string;
  objectiveId: string | null;
  title: string;
  dueAt: IsoDateTime;
  durationMinutes: number;
  state: 'planned' | 'in_progress' | 'completed' | 'skipped';
};

export type StudyPlanContract = {
  ownerId: Uuid;
  timezone: string;
  items: StudyPlanItemContract[];
  updatedAt: IsoDateTime;
};

export type AiRunMetadataContract = {
  runId: string;
  capability: 'chat' | 'quiz-generation' | 'grading' | 'notes' | 'planner' | 'paper';
  provider: string;
  model: string;
  configVersion: string;
  promptVersion: string;
  inputDigest: string;
  startedAt: IsoDateTime;
  durationMs: number;
  outcome: 'success' | 'degraded' | 'blocked' | 'failed';
  errorClass?: string;
  /** No prompt, answer, email, name, or other sensitive payload belongs here. */
  sensitivePayloadStored: false;
};
