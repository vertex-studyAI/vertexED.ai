# Diamond Challenge 2027 — VertexED validation protocol

Status: pre-submission evidence protocol; no outcomes recorded yet.
Date frozen: 2026-09-09.
Target: Diamond Challenge 2027, Business Innovation.
Purpose: close the evidence gap identified in the first-round package without manufacturing traction or changing the venture thesis after seeing favorable anecdotes.

## 1. Decision this protocol is meant to support

The current competition thesis is:

> VertexED turns a marked practice attempt into the next study action, so students spend less time stitching together tools and more time closing the exact gaps that cost marks.

The submission should only retain this thesis at full strength if direct student evidence supports both sides of it:

1. students actually experience a workflow break between practice, feedback, planning, and retrieval; and
2. the current VertexED prototype can carry a student through that loop without major operator rescue.

This protocol is deliberately small. It is not a learning-outcomes trial and must not be used to claim that VertexED raises grades, improves exam scores, reduces study time, or outperforms teachers or competing products.

## 2. Frozen sample and stopping rule

Collect exactly:

- 10 structured student interviews; and
- 5 end-to-end revision-loop usability tests.

Do not stop early because responses look favorable. Do not add only favorable participants after an unfavorable first batch. Additional interviews may be collected later, but the first 10 interviews and first 5 valid usability tests must be preserved as the competition evidence cohort.

Recommended participant mix for the 10 interviews:

- at least 6 students currently preparing for board-style or externally assessed secondary-school exams;
- no more than 5 participants from the same curriculum;
- no more than 3 participants who are close friends, team members, or existing VertexED contributors;
- include both current VertexED testers and students who have never used VertexED.

Record relationship to the team so judges are not presented with an apparently independent sample that is actually mostly insiders.

## 3. Interview protocol — 10 students

Keep each interview to 12–15 minutes. Ask the questions in this order before showing VertexED. Avoid leading language such as “Would an integrated platform help you?”

### Required questions

1. Think about the last important test or mock you prepared for. What did you actually do during the final seven days?
2. Which apps, websites, documents, teachers, tutors, or physical materials did you use?
3. How did you decide what topic or question type to study next?
4. When you completed a practice paper or set of questions, how did you decide why you lost marks?
5. What happened to a mistake after you identified it? Did it change your schedule, become another practice task, become a flashcard, or usually stop there?
6. Tell me about the last time you knew you were weak at something but still did not revisit it before the assessment. What happened?
7. Which part of exam preparation currently takes the most unnecessary effort?
8. Where do generic AI/chatbot answers help you, and where do they fail to match how your assessment is actually marked?
9. What, if anything, do you currently pay for to prepare for exams? Do not ask for willingness-to-pay yet; first establish current behavior.
10. If one part of your current workflow disappeared tomorrow, which would create the biggest problem?

### After the unaided questions

Show a neutral 60–90 second explanation of the VertexED loop without describing it as better than current tools:

Plan → Focus → Practise → Review → Remember.

Then ask:

11. Which part of this loop, if any, addresses a problem you already described?
12. Which part feels unnecessary or unrealistic?
13. What would have to work reliably before you would use this for a real exam?
14. What would stop you from returning after trying it once?

### Evidence to retain per interview

Create one dated record containing:

- participant code, not a public full name;
- curriculum/year level;
- current VertexED user: yes/no;
- relationship to team: none / acquaintance / friend / contributor;
- tools used in last exam-prep week;
- exact or near-verbatim notes for questions 1–14;
- one sentence summarizing the strongest workflow pain;
- one sentence summarizing the strongest objection to VertexED;
- permission status for any quotation: private-only / anonymous public quote / named public quote.

Do not convert “sounds cool” or “I would use this” into traction.

## 4. Interview analysis plan

Before reading across all interviews, use the following fixed coding categories:

- fragmented tool switching;
- unclear next-study-action;
- poor conversion of mistakes into follow-up work;
- shortage of assessment-shaped practice;
- weak command-term/mark-scheme feedback;
- scheduling realism problem;
- retrieval/remembrance problem;
- no meaningful workflow problem reported;
- product objection: trust/accuracy;
- product objection: effort/setup;
- product objection: existing tool already sufficient;
- product objection: teacher/tutor preferred;
- product objection: price;
- other.

For the first 10 interviews, report simple counts only. Do not present percentages with false precision beyond `x/10`.

A defensible competition statement might be:

> In our first 10 structured interviews, X students independently described [coded problem].

Only use that sentence if X is actually supported by the frozen records. Retain contradictory interviews.

## 5. End-to-end usability protocol — 5 students

The product thesis depends on the loop, so isolated feature demos are insufficient. Each valid test must attempt the same end-to-end task.

### Scenario

“Imagine you have an assessment in 7 days. Choose one topic you genuinely need to revise. Starting from VertexED, plan a study action, complete or simulate one assessment-shaped practice attempt, review the feedback, identify one concrete weakness, and turn that weakness into a future retrieval or study action.”

The moderator may explain the scenario but should not tell the participant which button to press unless the participant is blocked.

### Required milestones

Record whether the participant can, in order:

1. establish the exam/deadline or revision context;
2. identify/select a target topic;
3. start an assessment-shaped practice action;
4. reach a review state that distinguishes marks earned/lost or actionable weaknesses;
5. identify at least one concrete weak concept, step, or command-term failure;
6. convert that weakness into a scheduled follow-up/retrieval action;
7. find that follow-up action again without moderator explanation.

### Operator-rescue scale

For each milestone record:

- 0 = completed without help;
- 1 = participant needed a neutral prompt such as “what would you try next?”;
- 2 = moderator had to explain where/how to perform the action;
- 3 = action could not be completed because of a product failure, dead end, missing capability, or blocking defect.

Do not silently fix failed runs and report only the rerun. If a bug is corrected, preserve the original result and label the subsequent run as a post-fix rerun.

## 6. Usability success criteria

The minimum evidence gate for keeping the full “closed revision loop” claim is:

- all 5 tests reach the practice stage;
- at least 4/5 reach actionable review without a score-3 failure;
- at least 4/5 create a follow-up action tied to a weakness;
- at least 3/5 can later locate that follow-up action without moderator explanation;
- no unresolved safety, privacy, authentication, or data-loss defect appears during the five tests.

These thresholds are a competition positioning gate, not a scientific efficacy threshold.

If the gate fails, narrow the narrative. Examples:

- If Review works but scheduling the next action does not, describe VertexED as an integrated practice-and-feedback workspace rather than a closed revision loop.
- If assessment-shaped practice is unreliable, do not center Paper Maker as the wedge.
- If students consistently prefer teacher feedback for mark-loss diagnosis, position the product as teacher-complementary workflow infrastructure rather than an autonomous reviewer.

## 7. Funnel evidence — optional but high value

If product analytics are available and definitions can be verified, export a dated small funnel using exact event definitions:

landing visit → waitlist/start → first practice → feedback viewed → follow-up/retrieval action created.

For every metric preserve:

- date range;
- event definition;
- unique-user vs event count;
- denominator;
- exclusions;
- source/export file.

Do not combine historical signups, waitlist entries, subscribers, beta users, and active users into one headline number.

A retention proxy may be reported only if the event can be measured consistently:

> number of testers who complete a second revision loop within 7 days of their first completed loop.

Do not call this “retention” without defining it in the narrative.

## 8. Failure log

Maintain a chronological failure log during validation. Minimum fields:

| Date | Participant/Test | Step | Failure or objection | Severity | Fix attempted? | Retest? | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |

Failures are application evidence too. A credible iteration story is stronger than hiding defects.

## 9. Competition claim map after evidence collection

For every factual claim added to the final narrative, maintain:

| Proposed claim | Evidence source | Date | Denominator/definition | Safe wording | Status |
| --- | --- | --- | --- | --- | --- |

Required statuses:

- verified;
- supported but narrow;
- hypothesis only;
- rejected by evidence;
- unresolved.

No user-count, revenue, partnership, score-improvement, grading-accuracy, school-adoption, or production-certification claim may move to `verified` without a dated primary source.

## 10. Business-model validation question

Only after the core workflow interview is complete, ask a separate pricing question so it does not contaminate problem discovery:

“Which of these best matches how you would expect a product like this to be paid for: free with limits, student subscription, school/tutor purchase, one-time exam-season purchase, or I would not pay for it?”

Follow with:

“What would have to be true before paying made sense?”

Do not convert hypothetical willingness-to-pay into revenue or demand.

## 11. Artifact package to attach to the Diamond preparation branch

Before changing the narrative with any validation claim, add or link:

1. `diamond-2027-interviews-summary.md` — participant codes, coding counts, objections, and only permission-cleared quotes;
2. `diamond-2027-usability-results.md` — five frozen first-run records and any clearly labeled reruns;
3. `diamond-2027-failure-log.md` — all material failures and their status;
4. any dated analytics export used for funnel/return-use claims;
5. updated claim map showing exactly which narrative sentences changed and why.

Raw interview notes containing personal information should not be committed to a public repository. Store them privately and commit only redacted summaries.

## 12. Submission rule boundary

This protocol does not resolve the remaining competition compliance gates. Before submission the team must still verify:

- every competition team member is a high-school student aged 14–18 at the 2027-01-14 deadline;
- one adult advisor aged 21+ is named;
- all material creators are either on the team or disclosed according to the rules;
- the team makes a final Business Innovation pitch-format selection;
- the 3–5 page narrative and public 60-second video comply exactly with the then-current official Diamond Challenge rules.

No submission should be made from this branch until those human/compliance fields are explicitly resolved.