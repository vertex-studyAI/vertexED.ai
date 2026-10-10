# VertexED Learning OS audit · 27 September 2026

> Historical source-worktree audit copied with the Learning OS implementation. The integrated 28 September candidate also adds native PDF text import and account-backed conversations; use [the integration report](FEATURE_COMPLETION_2026-09-28.md) for current features, verification and GitHub status. References below to absent PDF support or no push describe this earlier source snapshot.

## Baseline

Inspected runtime routes, layout, Main, LearningWorkspace, learningModel, practiceSession, learningStore, adaptivePractice, original question bank, learner-state server and normalisers, notebook import/output/source preview, Apex hook/context/policies, search, planner, styles, tests, deployment scripts and migrations before changing runtime. This is a structural audit, not live-service certification or an editorial review of all course content.

Existing changes to CI, README, release/readiness reports and the next-actions checklist are preserved. DO_NOT_USE_AS_CANONICAL.md identifies this checkout as WIP. No production promotion is implied.

| Surface | Existing evidence | Finding / direction |
| --- | --- | --- |
| Frontend/design | React/Vite, lazy routes, blue/white paper tokens, original logo | Extend authenticated learning; preserve identity |
| Backend/auth/database | Same-origin APIs, bearer verification, owner predicates, rate limits, Supabase RLS, account outbox | Preserve boundaries; live auth/RLS/migration replay unverified |
| Curriculum/skills | Graph derived from 25 original questions across three subjects | Bounded practice coverage, not a complete syllabus |
| Attempts/mastery | Server-recomputed answer checks, distinct questions/days required | Preserve rules; expose evidence and prerequisite gaps |
| Recommendations | Attempts, deadlines, commitments and due cards | Five-minute budget may be empty; duplicate concept actions; links ignore duration |
| Today | Useful tools but competing actions and generic timer | Resume actual practice, explicit budgets, useful next action |
| Practice | Local checks, saved sessions, cross-tab protection, diagnostic adaptation | Difficulty text masquerades as hint; confidence defaults to a claim; no corrective retry |
| Mistakes | Manually saved reflections | Errors invisible unless saved manually; derive notebook from attempts |
| Exams | Timer, flags, fixed set, deferred feedback, topic review | Explicit conditions, accessible statuses and repair actions needed |
| AI/prompts | Apex modes, cancellation, bounded context, source grounding | Carry question and evidence into contextual help |
| Upload/PDF/Drive | Text/Markdown/CSV, 200 KB, UTF-8, 50,000 characters; manual PDF excerpts | Preview before import; native PDF/OCR/slides/Drive not implemented |
| Sources | Notebook source IDs, excerpts, preview and output controls | Preserve citations; never invent pages |
| Flashcards | Editable deck, scheduling, keyboard study | Secondary utility |
| Planner/calendar | Manual tasks, movement, persistence, conflict-aware rebalancing | Preserve commitments; no Google Calendar sync |
| Analytics/history | Privacy-filtered events and attempt history | Bounded action events, date ranges and actual recurrence |
| Payments/subscriptions | No billing implementation found in runtime search | Do not fabricate subscription states |
| Notifications | Server notification helpers, in-product status | No new push service claimed |
| Accessibility/mobile | Focus-safe modal, theme and motion preferences | Inspector keyboard access, bottom nav and responsive checks |
| Tests/deploy | Node 22, application/browser tests, bundle gate, Vercel scripts | Local receipts are not production certification |

## Reference research

Read [Brilliant paths](https://brilliant.org/help/features/what-are-learning-paths/), [Khan mastery](https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery) and [Study Mode](https://help.openai.com/en/articles/11780217-using-study-mode-in-chatgpt): ordered concepts, explicit skill evidence, small hints and understanding checks. Reviewed the supplied Duolingo article and GeoGebra public catalogue. Desmos returned no readable homepage text; the existing local graphing integration was inspected. Quizlet pages returned 403; the second Khan article redirected to inaccessible sign-in; PostHog dashboards was unavailable. No inaccessible workflow is claimed as inspected. Transfer interaction principles, not branding or scoring algorithms.

## Acceptance ledger

| Phase | Implemented locally | Limits retained |
| --- | --- | --- |
| 0: audit | Repository and reference inspection above | No live production certification |
| 1: design system | Existing cobalt/white tokens, opaque reading surfaces, 44px controls, consistent contextual rail, reduced motion | No new dependency or replacement identity |
| 2: shell | Compact Today/Courses/Practise/Mistakes/Study plan/Exam prep navigation; five-item mobile bottom nav; search actions | Existing tool routes remain available through search and the tool directory |
| 3: Today | Short header, collapsed directory, resume saved practice, 5/15/30/60 shortcuts, reasons and estimates, capped five actions, needs-attention links, actual assessment dates | No invented readiness or estimated mastery percentage |
| 4: knowledge | Expandable available-topic hierarchy, compact skill rows, evidence inspector, prerequisite-first path, searchable/filterable graph with zoom/pan and immediate dependency highlights | Bank hierarchy is explicitly not a complete syllabus |
| 5: practice | Time budget reaches question selection, feedback time reserved, adaptation bounded by original duration, optional sampled confidence, numeric Enter submission | No model request needed to select or check an original question |
| 6: help | Progressive hint/first step/solution; contextual Apex drawer carries question, answer and recent evidence; assisted correction preserves original response | Older bank items reuse a small concept cue and first worked step; new complex items have authored hints. AI output stays provisional |
| 7: mistakes | Every incorrect attempt appears automatically; editable learner category/reflection; dates, recurrence, original response, correction status, related-question repair | No claim that the system knows the mental cause; sparse topics explicitly disclose missing transfer questions |
| 8: exam | Explicit conditions, hidden help, accessible answered/flagged navigator, final-minute warning, deferred feedback, per-skill evidence changes and repair actions | Original answer-key marks only; no official grades, proctoring or predicted exam outcomes |
| 9: upload/source | Editable preview before saving, detected Markdown headings, title/content editing, cancel, source rail with readable text and retained source IDs | Text/Markdown/CSV only; PDF/slides require pasted excerpts. Heading detection is not syllabus extraction |
| 10: plan/history | Due-today/overdue/upcoming groups, history date ranges, privacy-filtered budget/start/completion/help events; existing planner rebalancing retained | Due reviews remain available until attempted; no validated forgetting curve or automatic learning-efficacy claim |
| 11: quality | Responsive correction pass, keyboard/Escape/focus, motion/theme checks, size budgets, persisted-session and conflict tests | WCAG conformance needs a fuller assistive-technology audit; this pass does not certify it |

## Learning content and evidence

Added ten original complex-number questions. The current bank has **35 questions** across Mathematics, Physics and Computer Science. The new sequence covers modulus, argument, polar form, De Moivre and roots of unity, with two non-answer hints per new question. Answer keys are checked against direct mathematical calculations in `tests/learning-journey.test.mjs`. A pointer- and keyboard-operated complex plane supports a conceptual check without writing fabricated assessment evidence.

The existing mastery rule remains unchanged: at least three recent correct unassisted attempts, across two questions and two days, with the latest correct and unassisted. The new coverage makes that criterion attainable for more mapped concepts. It does not independently validate the criterion. Corrective retries are explicitly assisted, never overwrite an original score, and keep errors in history.

Session review compares original submissions with evidence preceding the session; later corrections and unrelated concurrent attempts do not alter that comparison. There are no invented learner histories, grades, retention probabilities or confidence-calibration claims.

## Storage, schema and API

No SQL migration, new endpoint, provider-policy change or external service mutation. The existing account-scoped attempt/reflection records, server answer recomputation and outbox remain in use. The device session parser now accepts already-supported nullable confidence, optional validated hint level and optional 5–60 minute budget. Legacy sessions remain readable. Hint level is device-session state; synced attempts retain the existing assisted/unassisted flag. Practice writes now notify Today and other learning views immediately.

Corrupt data, cross-tab conflicts, account switching and storage failures retain the existing recovery boundaries. Live Supabase RLS, OAuth, real-provider responses and account synchronisation require separate live verification; browser tests use an explicitly synthetic account harness.

## Visual correction pass

Inspected captures at 1440, 1024 and 390px in light and dark modes. Shortened Today’s competing header, collapsed the tool directory, compacted active-practice chrome, moved account-sync details into a disclosure, and made rail headings/Close controls sticky. Rail opening stops background scrolling. Source reading text uses 16px instead of the former 12px preview. New-flow tests also exercise reduced motion, keyboard sliders, focus restoration and enlarged root text at 200%.

## Verification

Receipts: `ci-evidence/learning-os-20260927/`. Final counts are recorded after the final browser matrix finishes.

The first broad lint invocation failed on five duplicate-export fixtures under pre-existing `.release-work/.../tmp/vertexed-performance-*/assets/app.js`, with eight warnings in preserved copied source. Runtime lint checks `src api tests e2e scripts` separately; no baseline suppressions were added. The copy scan reported zero findings. Content provenance still reports 245 imported guide files, zero approved and 53 flagged for editorial review; no approval was fabricated.

Earlier failures are retained: sandbox loopback denial before the permitted browser rerun, an outdated dropdown selector in the new test, an incorrect correction-answer fixture, and one revision-stamp test run overlapping the build. Sequential application tests subsequently passed. These are distinguished from the final receipts rather than deleted.

## Remaining work and release boundary

1. Full board-specific syllabi, editorial approval, deeper question coverage and enough distinct examples/transfer items for a universal 3–5-question repair protocol. This pass implements bounded repair using the available bank and discloses gaps.
2. Native PDF/OCR/slides/Drive ingestion, page-level document coordinates and robust semantic topic extraction. Current excerpts have real source references but no inferred PDF page citations.
3. Independent learner research and calibration before claiming validated mastery, retention, diagnosis or readiness. No efficacy claim is made from local tests.
4. Live auth/RLS/provider verification and canonical release reconciliation. This WIP checkout remains unsuitable for unattended production promotion. No commit, push, deployment or DNS change was made.
5. Repository-wide lint needs the owner’s existing release-work fixture isolation reconciled. The copied work was preserved. Local browser and runtime checks cannot establish a fully green production pipeline.
