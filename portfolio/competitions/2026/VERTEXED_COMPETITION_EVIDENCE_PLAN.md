# VertexED Competition Evidence Plan

Status date: 2026-08-28

## Competition claim

VertexED should be presented as a board-aligned mastery loop, not as a generic AI study assistant.

Core loop:

`curriculum -> diagnostic/practice -> student answer -> rubric review -> gap detection -> next action -> retest -> progress evidence`

The current repository documents working product surfaces including notes, quiz generation, mock/paper generation, review, chatbot, planner, Supabase auth/data and serverless AI routes. The competition entry must only claim the subset proven by exact-head CI, production smoke, and manual QA.

## Judge-ready deterministic flow

A demo account should support one reliable path with no dependence on hidden operator actions during judging.

### Step 1 — Authentication
- account can be created via the authorized waitlist/invite path
- login succeeds
- logout succeeds
- protected AI routes fail closed after logout

### Step 2 — Curriculum context
- select curriculum/level
- select subject
- select one tightly scoped topic
- preserve selection through the judge flow

### Step 3 — Assessment item
- generate or load a deterministic assessment question
- display marks/rubric context where appropriate
- allow student response entry

### Step 4 — Review
- return structured feedback
- identify awarded/lost marks
- identify concept/skill gap
- distinguish rubric evidence from generic advice

### Step 5 — Action
- produce one concrete next-study action
- recommend one targeted note/practice activity
- avoid implying a validated learning diagnosis if the signal is heuristic

### Step 6 — Retest
- present a second item testing the same skill
- record result separately
- show before/after evidence without claiming causality

### Step 7 — Progress view
- show attempts, scores and skill/topic labels
- preserve account isolation
- no fabricated streaks, achievements or usage

## Production gate

Do not call the product competition-ready until the repo's production launch conditions are satisfied:

- required Vercel environment variables configured
- required Supabase schema/migrations and auth providers configured
- `npm run ci` passes
- `npm run test:smoke` passes against production
- manual QA checklist passes on desktop and mobile
- GitHub Actions is green on the exact deployed head

## Pilot design

Goal: generate bounded, auditable evidence for a competition submission.

### Scope
- one curriculum
- one subject
- one unit/topic
- 20–30 participants if feasible
- fixed/equated pre/post assessments
- 5–7 day intervention window

### Metrics
- pre-test score
- post-test score
- completion rate
- number of completed practice/review loops
- repeat-session rate
- median time to first useful feedback
- self-reported usefulness (secondary, not a learning outcome)

### Analysis
Report:
- n enrolled
- n completed
- mean/median pre and post
- individual paired deltas
- distribution, not only average
- missing data/dropout
- exact intervention
- known confounders

Do not infer general learning effectiveness from a tiny convenience sample.

## Interview script — students

1. Walk me through how you prepared for your last difficult test.
2. Where did you lose the most time?
3. How did you know what you actually misunderstood?
4. How did you check whether an answer would receive marks?
5. What did you do after finding a mistake?
6. Which tools did you switch between?
7. What would make you return to one study tool several times in a week?
8. Show a recent real workflow if comfortable; do not lead them toward VertexED.

Record exact quotes only with permission.

## Interview script — teachers

1. What mistakes do students repeat despite receiving feedback?
2. Which parts of marking/review are hardest to scale?
3. Where do generic AI tools misalign with your curriculum or mark schemes?
4. What evidence would you need before recommending a study tool?
5. What teacher-facing visibility is useful vs intrusive?
6. What would make a pilot low-friction?

## Evidence ledger schema

For every public metric preserve:

| field | meaning |
|---|---|
| metric_id | stable identifier |
| claim | exact public wording |
| value | number/text |
| date_range | measurement window |
| population | who/what was measured |
| source | export/log/query/screenshot |
| owner | person responsible |
| limitations | caveats |
| verified_at | verification time |
| safe_to_publish | yes/no |

## Pitch deck evidence order

1. real student workflow problem
2. board-aligned mastery-loop demo
3. verified usage/pilot evidence
4. bounded before/after evidence if available
5. teacher/customer validation
6. business model
7. acquisition path
8. defensibility from workflow/data integration, not unsupported model-novelty claims
9. roadmap
10. team

## Next engineering tickets

- competition judge-flow smoke test
- deterministic demo fixture/account strategy
- progress/mastery evidence view audit
- pilot analytics export
- evidence-ledger generator
- pitch-demo recording script
