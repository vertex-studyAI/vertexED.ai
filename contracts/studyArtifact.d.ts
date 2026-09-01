export const STUDY_ARTIFACT_KINDS: readonly [
  'note',
  'review',
  'paper',
  'planner',
  'notebook',
];

export type StudyArtifactKind = (typeof STUDY_ARTIFACT_KINDS)[number];
export type StudyArtifactPayload = Record<string, unknown>;

export type ContractResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type StudyArtifactCreate = {
  kind: StudyArtifactKind;
  title: string | null;
  payload: StudyArtifactPayload;
  replace: boolean;
};

export function isStudyArtifactKind(value: unknown): value is StudyArtifactKind;
export function isPlainRecord(value: unknown): value is StudyArtifactPayload;
export function normalizeStudyArtifactPayload(value: unknown): ContractResult<StudyArtifactPayload>;
export function parseStudyArtifactCreate(value: unknown): ContractResult<StudyArtifactCreate>;
