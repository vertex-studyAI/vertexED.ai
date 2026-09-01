export type EvidenceSpan = {
  quote: string;
  start: number;
  end: number;
};

export type CriterionGrade = {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  evidence: EvidenceSpan[];
  feedback: string;
  evidenceVerified: boolean;
};

export type GradingErrorCode =
  | 'CONCEPT_GAP'
  | 'EVIDENCE_GAP'
  | 'REASONING_GAP'
  | 'COMMAND_TERM'
  | 'CALCULATION'
  | 'COMMUNICATION'
  | 'INCOMPLETE';

export type VerifiedGradeAudit = {
  contractVersion: 'vertexed.grading.v1';
  auditId: string;
  id: string;
  score: number;
  maxScore: number;
  scoreStatus: 'VERIFIED' | 'PROVISIONAL';
  confidence: number;
  humanReviewRequired: boolean;
  escalationReason: string | null;
  feedback: string;
  includes: string;
  criteria: CriterionGrade[];
  errors: Array<{ code: GradingErrorCode; label: string; remediation: string }>;
  remediation: string[];
  objectiveIds: string[];
  model: string;
};

export type LearningArtifactProvenance = {
  source: 'learner-notes' | 'official-resource' | 'synthetic-eval';
  sourceDigest?: string;
  generator: string;
  generatorVersion: string;
  model?: string | null;
  generatedAt?: string;
  board: string;
  subject?: string;
  subjects?: string[];
};

export type AssessmentCoverage = {
  objectiveId: string;
  attempted: number;
  verified: number;
  score: number;
  maxScore: number;
  masteryPercent: number | null;
};
