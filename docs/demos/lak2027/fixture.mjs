// Constructed study records. No learner, account, provider, or production data.
export const ANALYTICS_REVISION = '2fcb4793af20687b35fd147b9aa374dcb621ee9b';
export const metadata = {
  generated_at: '2026-10-07T17:00:00.000Z',
  source_revision: ANALYTICS_REVISION,
  source: 'Constructed LAK demonstration fixture; analytics core unchanged from source_revision',
};

export function makeExampleRecords() {
  const base = {
    consent_opt_in: true,
    curriculum: 'Example curriculum',
    subject: 'Biology',
    topic: 'Cell transport',
    pre_assessment: { id: 'example-pre', score: 0, max: 10 },
    post_assessment: { id: 'example-post', score: 3, max: 10 },
    intervention_start: '2026-10-01T10:02:00Z',
    intervention_end: '2026-10-01T10:12:00Z',
    started_at: '2026-10-01T10:00:00Z',
    completed_at: '2026-10-01T10:15:00Z',
    completed_practice_loops: 1,
    completed_review_loops: 1,
    completion_flag: true,
    usefulness_rating: null,
  };
  return [
    { ...structuredClone(base), participant_id: 'example_A', session_id: 'attempt-01' },
    { ...structuredClone(base), participant_id: 'example_A', session_id: 'retry-02',
      pre_assessment: { id: 'example-retry-pre', score: 2, max: 10 },
      post_assessment: null, completed_at: null, completion_flag: false },
    { ...structuredClone(base), participant_id: 'example_B', session_id: 'attempt-03',
      pre_assessment: { id: 'example-pre', score: 4, max: 10 } },
    { ...structuredClone(base), participant_id: 'example_C', session_id: 'attempt-04',
      consent_opt_in: false },
    { ...structuredClone(base), participant_id: 'example_D', session_id: 'attempt-05',
      pre_assessment: { id: 'example-pre', score: '', max: 10 } },
    { ...structuredClone(base), participant_id: 'example_E', session_id: 'attempt-06',
      intervention_start: '2026-02-30T10:02:00Z' },
  ];
}
