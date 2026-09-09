# VertexED bounded learning-outcome pilot protocol

Status: preregistered design and operational admission gate; no pilot outcome has been collected or claimed.

## Claim and design

This pilot estimates whether one VertexED revision loop improves near-term knowledge
and delayed retention for the selected material. It does not estimate exam grades,
causal impact beyond the recruited population, or the value of AI in isolation.

- Population: consenting students aged 18+, or students with institutionally approved
  guardian/ethics consent, studying one supported course.
- Unit: one learner-topic pair. Target at least 30 completed pairs before reporting
  descriptive intervals; label smaller samples exploratory.
- Design: preregistered within-subject pretest, bounded intervention, immediate
  post-test, and seven-day delayed test. Use parallel, independently reviewed item
  forms and randomize form order. Do not train or prompt the model with evaluation
  answers.
- Intervention: 35 minutes maximum: plan, focused review, one mock response,
  evidence-bounded feedback, one remediation, and retrieval practice.
- Comparator: the learner's normal 35-minute study session on a matched topic, with
  topic/order counterbalanced where feasible.

## Frozen learning measures

Primary: delayed retention, calculated as delayed-test percent minus pretest percent.
Secondary: immediate gain, measured task completion, active time-on-task, and a
five-point usefulness item. Report median and bootstrap 95% intervals, paired effect
size, missingness, exclusions, and every adverse or blocked run. Do not replace
missing delayed tests with immediate scores.

## Operational admission gate

The learning-outcome study must not begin until the versioned reliability and user-feedback gate in `evals/pilot/gates-v1.json` is frozen and satisfied on private-beta traffic:

- at least 100 provider runs and 50 explicit feedback events;
- provider success rate at least 98%;
- `incorrect` feedback at most 10%;
- combined `not_helpful` and `incorrect` feedback at most 20%.

Run `npm run pilot:report -- --days=14` in an authorized operator environment. A report with fewer samples or a truncated 10,000-row query is `INSUFFICIENT_EVIDENCE`, never a pass. Changes require a new gate version; do not edit a frozen gate after inspecting outcomes.

These operational metrics are not learning evidence. They cannot establish grade improvement, retention improvement, or causal educational impact.

## Leakage and integrity controls

Freeze item forms, scoring rubric, analysis code, thresholds, model/config identity,
and source revision before enrollment. Evaluators scoring open responses are blinded
to condition. Store only participant codes in analysis data; keep the re-identification
key outside the application. Exclude prompts, answers, emails, names, and access tokens
from telemetry. Record deviations and negative results; never tune on the final form.

The operational source is `public.observability_events`. It stores fixed categories,
model/provider identifiers, bounded durations, response status classes, and fixed
feedback/reason categories. It must not store identity, study content, full URLs,
request headers, or free-form feedback. Preserve only aggregate reports in the repository.

## Safety, consent, and stopping

Participation is voluntary and has no effect on grades or access. Learners may stop
and request deletion. Automated scores stay provisional until confirmed by a qualified
human or validated answer key. Stop the pilot for cross-account exposure, incorrect
deletion, unbounded harmful output, or a serious consent incident. Escalate disputed
grading to a qualified human reviewer.

## Evidence states and publication boundary

- **Completed evidence:** synthetic grading contract fixtures and repository tests, reported separately by their versioned artifacts.
- **Negative results:** none collected under this protocol yet.
- **Hypotheses:** learners can complete the measured practice/retry loop; provider reliability and fixed-category feedback will meet the frozen operational gate; the intervention may improve delayed retention relative to the bounded comparator.
- **Unsupported conclusions:** improved grades, improved retention, curriculum alignment, official examiner equivalence, and causal educational benefit.

Publish the preregistration, de-identified aggregate table, analysis code, attrition,
model/config hashes, exact application revision, and protocol deviations. Outcome
claims remain `NOT_MEASURED` until this protocol is run; source tests, operational
telemetry, and synthetic grading fixtures are not learning-outcome evidence.
