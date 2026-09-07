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

export type GradeAudit = {
  contractVersion: 'vertexed.grading.v2';
  auditId: string;
  id: string;
  score: number;
  maxScore: number;
  scoreStatus: 'EVIDENCE_LINKED' | 'PROVISIONAL' | 'MEASURED';
  confidence: number;
  humanReviewRequired: boolean;
  measurementEligible: boolean;
  evidenceState: 'MODEL_EVIDENCE_LINKED' | 'MODEL_PROVISIONAL' | 'HUMAN_CONFIRMED' | 'VALIDATED_ANSWER_KEY';
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
  measured: number;
  score: number;
  maxScore: number;
  masteryPercent: number | null;
};
