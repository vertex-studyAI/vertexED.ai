# VertexED Controlled Pilot Protocol — September 2026

**Status:** PRE-OUTCOME / DO NOT EDIT AFTER PARTICIPANT OUTCOMES ARE INSPECTED

## 1. Question

For students studying matched course material, does a bounded VertexED-assisted study session produce a larger learning gain than an equal-duration conventional review session?

This is a product-learning pilot. It does not establish broad educational efficacy, school-wide impact, or causal effectiveness outside the tested students/topics.

## 2. Minimum viable design

Use a randomized two-sequence crossover design so each participant experiences both conditions.

- Target: 12–24 students from one reasonably comparable course/level.
- Two topic sets, A and B, matched as closely as practical for difficulty and prerequisite load.
- Sequence 1: VertexED on A; conventional review on B.
- Sequence 2: conventional review on A; VertexED on B.
- Randomly assign sequence before outcomes.
- Equal session duration: 25 minutes per condition.
- Do not use the pilot for graded/high-stakes assessment.

### Conventional-review control

The control condition must have real study material and the same time budget. Freeze the allowed materials before the pilot (for example: class notes + textbook/problem set). Do not intentionally weaken the control.

### VertexED condition

Freeze the product revision and enabled feature set before the first outcome session. Record the exact served revision where technically available. Do not silently add/remove features midway through the pilot.

## 3. Outcome schedule

For each topic/condition:

1. **Pre-test:** 8–12 questions before study.
2. **Study session:** exactly 25 minutes.
3. **Immediate post-test:** 10–15 parallel questions.
4. **Delayed check:** 6–10 questions approximately 7 days later where feasible.
5. **Usability check:** short structured survey after each condition.

Question sets must be fixed before inspecting pilot outcomes. Avoid reusing identical questions between pre/post when recall would inflate the estimate.

## 4. Primary outcome

Primary metric: **paired difference in percentage-point learning gain**.

For participant `i`:

`gain = post_test_percent - pre_test_percent`

Primary estimate:

`VertexED gain - Control gain`

Report:

- participant-level paired differences;
- mean and median paired difference;
- sample standard deviation;
- 95% confidence interval or clearly labeled descriptive interval appropriate to the final analysis method;
- number of participants with positive / zero / negative paired differences.

Do not replace the primary metric after outcomes are visible.

## 5. Secondary outcomes

Report separately; they do not override a failed primary result.

- delayed-retention difference;
- completion rate;
- actual time-on-task;
- number of generated-feedback correctness failures found by review;
- number of sessions requiring manual recovery;
- user-rated clarity/usefulness;
- return intent;
- feature-level usage counts where instrumentation is privacy-safe.

## 6. Predeclared pilot interpretation

This pilot is **promising** only if all of the following hold:

1. mean paired learning-gain difference favors VertexED;
2. the result is not driven by one obvious outlier (report leave-one-out sensitivity descriptively);
3. at least 80% of started sessions complete the intended path;
4. no critical answer-key/feedback correctness failure creates a plausible learning-harm case that is left unresolved;
5. no account-isolation/privacy incident occurs.

A small positive effect with wide uncertainty remains **inconclusive**, not validated efficacy.

A negative or mixed result is retained unchanged and should drive product changes or a new separately preregistered pilot.

## 7. Product freeze record

Before participant outcomes, record:

- production/preview URL used;
- exact Git commit / served revision if available;
- enabled VertexED features;
- model/provider versions where exposed;
- prompt/config revision where relevant;
- test-topic identities;
- control-material identities;
- randomization method and assignment;
- planned analysis script/notebook location;
- export fields and privacy review.

## 8. Data and privacy boundary

Use pseudonymous participant IDs in the analysis export.

Do not include in the research/evidence dataset:

- passwords or auth tokens;
- private chat transcripts unless explicitly necessary and properly approved;
- email addresses when a pseudonymous join key is sufficient;
- unrelated profile fields;
- application/essay content;
- sensitive personal information.

If participants are minors or the pilot is run through a school, follow the school's required consent/guardian/administrative process. If results are later intended for formal human-subject research publication, obtain the applicable ethics/consent determination before treating the product pilot as research evidence.

## 9. Failure retention

Retain and count:

- failed signups/logins;
- generation errors;
- incorrect feedback found in audit;
- abandoned sessions;
- missing post-tests;
- cross-account or data-isolation failures;
- participants who perform worse under VertexED;
- delayed-retention reversals.

Do not delete inconvenient participants or sessions after outcomes unless the exclusion rule was frozen beforehand. Report any exclusion and reason.

## 10. Evidence package

A completed pilot package should contain:

- protocol version/hash;
- randomization record;
- de-identified raw scoring table;
- scoring key/version;
- analysis script;
- product revision evidence;
- correctness/failure audit;
- aggregate results;
- limitations;
- exact claim authorized by the result;
- exact stronger claims still prohibited.

## 11. Claim ladder

### Before pilot

Authorized: `VertexED has a preregistered controlled product-learning pilot protocol.`

### After a completed but uncertain pilot

Authorized: report exact observed results and limitations.

Not authorized: `VertexED improves learning` as a broad claim.

### After a positive pilot

Authorized only if supported: `In this bounded pilot, students showed a higher average immediate learning gain in the VertexED condition than in the matched control condition.`

Still not authorized without stronger replication: school-wide efficacy, long-term GPA improvement, universal learning improvement, or superiority to teachers/tutors.

## 12. September execution gate

- [ ] Freeze two matched topic sets.
- [ ] Freeze pre/post/delayed question sets and scoring key.
- [ ] Freeze control materials.
- [ ] Freeze VertexED product revision/features.
- [ ] Freeze randomization and analysis method.
- [ ] Complete privacy/consent route.
- [ ] Recruit the bounded pilot cohort.
- [ ] Run sessions without mid-pilot rescue tuning.
- [ ] Analyze once under the frozen primary metric.
- [ ] Publish an evidence-bounded internal pilot report.
