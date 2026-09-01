# VertexED bounded learning-outcome pilot protocol

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

## Frozen measures

Primary: delayed retention, calculated as delayed-test percent minus pretest percent.
Secondary: immediate gain, verified task completion, active time-on-task, and a
five-point usefulness item. Report median and bootstrap 95% intervals, paired effect
size, missingness, exclusions, and every adverse or blocked run. Do not replace
missing delayed tests with immediate scores.

## Leakage and integrity controls

Freeze item forms, scoring rubric, analysis code, thresholds, model/config identity,
and source revision before enrollment. Evaluators scoring open responses are blinded
to condition. Store only participant codes in analysis data; keep the re-identification
key outside the application. Exclude prompts, answers, emails, names, and access tokens
from telemetry. Record deviations and negative results; never tune on the final form.

## Safety, consent, and stopping

Participation is voluntary and has no effect on grades or access. Learners may stop
and request deletion. Automated scores stay provisional whenever evidence or confidence
is insufficient. Stop the pilot for cross-account exposure, incorrect deletion,
unbounded harmful output, or a serious consent incident. Escalate disputed grading to
a qualified human reviewer.

## Publication boundary

Publish the preregistration, de-identified aggregate table, analysis code, attrition,
model/config hashes, exact application revision, and protocol deviations. Outcome
claims remain `NOT_MEASURED` until this protocol is run; source tests and synthetic
grading fixtures are not learning-outcome evidence.
