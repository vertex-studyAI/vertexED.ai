# Today Plan next-action repair

## Source and defect

Inspected `vertex-studyAI/vertexED.ai` at
`main@b96286ae19f665f9e5eef8a671258c98b7b73a16` on 6 October 2026.
The base was rechecked at 14:08 UTC and had not moved.

`Main` always passed `todayItems[0]` to `dashboardNextAction`, while
`TodayPlanPanel` held its own completion state. Marking the first item complete
updated the checklist but left **Start next step** pointing to that completed
item. Saved completion was also ignored when choosing the primary action after
mounting the dashboard.

The new test executes the actual `Main`, `TodayPlanPanel`, `todayPlan` storage
implementation and `dashboardNextAction`. Before the source repair, three of
four cases failed because the primary link remained `/planner` instead of
advancing to the next unfinished fixture task. The blocked-storage case already
passed and remains protected.

## Repair

- Keep the persisted completion set in `Main` and provide it to the plan panel.
- Choose the first unfinished plan item in the existing priority order.
- Return to the established mock, retry and saved-work fallbacks when all plan
  items are complete. Reopening an item makes it eligible again.
- Refresh completion on the existing dashboard focus and learner-state refresh
  paths, and bind the snapshot to its account owner.
- Keep the previous checklist and primary action when optional local storage
  rejects a write. The existing persistence helper remains unchanged.

No CSS, layout, copy, storage schema, dependency, database, auth provider,
production setting or evaluation protocol was changed.

## Local verification

Runtime: Node **22.22.0**, npm **10.9.4**, clean `npm ci --no-audit --no-fund`.
The dependency manifest and lockfile were not changed.

| Check | Result |
| --- | --- |
| New real-component regression on the unmodified base | 1 passed, 3 failed |
| New real-component regression after the repair | 4 passed, 0 failed |
| New regression plus existing Today Plan and learner-state account-storage suites | 18 passed, 0 failed |
| Application TypeScript check | Passed |
| ESLint on both changed components and the new test | Passed |
| Full product-copy scan | 374 files, 0 findings |
| `git diff --check` | Passed |

Reproduce the targeted checks with the repository's required Node 22 runtime:

```sh
node --test tests/today-plan-dashboard-runtime.test.mjs tests/today-plan.test.mjs tests/learner-state-account-storage.test.mjs
npm run typecheck
npx eslint src/pages/Main.tsx src/components/dashboard/TodayPlanPanel.tsx tests/today-plan-dashboard-runtime.test.mjs
npm run lint:copy
git diff --check
```

The component harness substitutes unrelated panels and external services. It
does not authenticate, contact a model or database, or claim to certify the
production learner journey. This is a state-wiring repair with unchanged visual
markup and styles; no new visual design or screenshot approval is claimed.

## Existing work and serving boundary

PRs #877 (first core action), #880 (truthful Today Plan persistence), and #883
(Apex routing modes) are already merged. This repair keeps their behavior.
PR #885 is closed unmerged and diagnostic-only; no CI gate from it was adopted.
PR #709 remains closed unmerged and its protected research protocol was not run.
The current open saved-work, feedback, mobile and dependency-audit patches were
not duplicated or folded into this change.

The read-only live resolver observed `https://www.vertexed.app` timing out with
`BLOCKED_TLS_OR_HTTP`. Its fallback `https://vertex-ed-ai.vercel.app` responded
HTTP 200 and reported the base revision
`b96286ae19f665f9e5eef8a671258c98b7b73a16`. These observations establish neither
custom-domain recovery nor authenticated production behavior.

Keep the repair in a draft PR for review. Hosted checks must be read on its exact
commit. No merge, production deployment, provider change, workflow dispatch,
paid compute, applicant submission or external message is part of this receipt.
