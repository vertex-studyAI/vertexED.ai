# VertexED improvement checklist, 21 September 2026

Scope: the existing WIP checkout. This is local implementation and test evidence,
not a canonical release or production certification. Existing uncommitted work
was retained. Intake tracked diff: `ci-evidence/improvements-20260921/baseline.patch`.

## Delivered behaviour

- [x] First session: a new learner enters one notebook route from the dashboard.
  The guide starts with a topic/source, opens quiz mode, explains saved answers,
  contextual review and scheduling a retry. Existing source import and notebook
  persistence are reused. No provider request occurs merely by opening the guide.
- [x] Landing: consolidated the repeated statement, subject-card and mastery
  examples. Kept the original logo, palette, curriculum explorer, working examples,
  learning-stage controls and all-subject navigation. Revision Stack opens in a
  native disclosure; the game and Concept Lens load on demand.
- [x] Dashboard: the primary action prioritises an unfinished mock, a due retry,
  recent saved work, then the first-session guide. Removed duplicate saved-work
  navigation. Empty attention panels no longer precede useful work. Loading and
  cloud failure do not masquerade as an empty collection.
- [x] Save feedback: notebook, planner and reviewer share explicit loading,
  saving, account, device and failed labels. Review failures retain the result
  and expose retry with the same idempotency key. The global notice no longer
  guarantees a device save when storage has not been checked; light-mode text
  uses semantic colours. Saved lists show each item's actual save location.
- [x] Practice and review: “Try this question again” keeps the original saved
  answer and feedback accessible, clears only the new response and focuses its
  editor. A saved review opens a prefilled manual planner task. Planned retries
  retain the original question, answer and feedback as well as their saved-work
  link, including across refresh and subsequent device-to-cloud sync. Scheduling
  practice does not confirm a mark or write a measured weakness.
- [x] Saved work: search title, subject, question and supported source text; filter
  by all five artefact kinds and actual save location; sort by date or title.
  Empty filter results have a reset. Pagination is explicitly labelled: filtering
  covers loaded items, not an unverified complete account export.
- [x] Responsive/accessibility implementation: inspected 1440px, 1024px and
  390px layouts, keyboard controls, native theme switching and reduced motion.
  Corrected the empty dashboard attention panel, filter affordance, mobile
  watermark overlap and delayed notebook panels under reduced motion.
- [x] Copy: clear action labels and provisional-feedback boundaries; copy lint
  reported zero findings. The content audit still reports 245 guides, zero approved
  and 53 flagged. Passing copy lint does not approve those guides.
- [x] Performance implementation: optional game and lens are separate lazy chunks;
  no new dependency. Frozen bundle budgets and request-deferral browser assertions
  passed. Local browser timing is not production Web Vitals.
- [x] Final verification receipts and correction-pass acceptance. All 30 distinct
  browser scenarios verified across the main and correction runs; the final
  reduced-motion/native-theme pass completed all nine browser/width combinations.

## Verification receipts

Evidence directory: `ci-evidence/improvements-20260921/`. Node 22.22.0.
The source manifest fingerprints the current WIP files: a Git HEAD stamp alone
cannot identify uncommitted code.

| Check | Result | Receipt |
| --- | --- | --- |
| Application tests | 1,098 passed | `app-tests-final.log` |
| Evaluation tests | 25 passed | `eval-tests.log` |
| Ask fixtures / grading contracts | Passed, synthetic/local only | `ask.log`, `grading.log` |
| Type checking | Passed | `typecheck.log` |
| Lint, copy lint and copy-rule tests | Passed; zero copy findings | `lint-final.log`, `correction-lint.log` |
| Production build | Passed | `build-visual-final.log` |
| Frozen bundle budgets | Passed, no caps changed | `bundle-final.log` |
| Thirty distinct browser scenarios | Verified across the main run and targeted correction run | `browser-accepted.log`, `browser-corrections.log` |
| Final reduced-motion and native-theme screenshots | 9 passed; captures inspected | `browser-visual-verified.log` |
| Production dependency audit | Passed with registry access; no high or critical findings | `audit-network-verified/result.txt` |
| Complete CI command | Passed end to end (exit 0), including dependency audit | `ci-network-verified.log` |

The 30 browser scenarios cover Chromium, WebKit and Firefox: immediate search,
keyboard navigation, saved-work recovery, closing/logout during a held response,
a fresh dashboard-to-notebook entry, file import, saved quiz answers and confidence,
quota failure/retry, regeneration retaining attempted versions, contextual review,
another attempt, a scheduled retry retained after refresh, saved-work filtering,
three responsive widths, and deferred optional game/lens loading.

The authenticated tests use disposable mocked sessions and API fixtures. They
exercise UI, local storage, payloads and recovery, not live OAuth, database RLS,
domain transport or deployed provider quality. Scheduling a retry is checked not
to add a measured weakness.

### Corrections and retained failed runs

- An early concurrent app/build run had three revision-stamp failures. The build
  restores the neutral generated module; tests were rerun separately and all
  1,098 passed. A legacy wording assertion was updated to explicit save recovery.
- New native filter options exposed an over-broad search test selector. Search
  tests now scope options to the search listbox; controls have explicit names.
- The first-session test now creates a notebook before checking its quiz controls.
- Isolated native controls confirmed that macOS WebKit requires Option+Tab to
  include buttons. Tests use that native key combination for Safari. The logout
  race now holds a response explicitly rather than relying on a 500ms window.
- `browser-accepted.log`: 26 passed, four test failures. The targeted correction
  run passed all 12 affected/relevant cases, covering the four failures.
- Screenshot review led to the reduced-motion fix: notebook panels now have no
  entrance animation or delay under reduced motion. Native theme controls are
  used for the final light/dark captures.
- Port 4190 was rejected by browser networking before the application loaded.
  That visual run is retained but is not application regression evidence; see
  `restricted-port-diagnosis.txt`. The final visual run on known-working 4188
  passed all nine combinations. No application code was changed for the port issue.

### Remaining release boundaries

The original full CI stopped because sandbox DNS could not resolve
`registry.npmjs.org`; the response therefore lacked advisory metadata. The
network-enabled production audit passed on its first attempt with no high or
critical findings. The original failure is retained in `ci.log`. The full
network-enabled `npm run ci` subsequently passed end to end (exit 0), including
1,098 application tests, 25 evaluation tests, the synthetic evaluation contracts,
production build and unchanged bundle budgets. Receipt: `ci-network-verified.log`.
All 17 source-manifest fingerprints were rechecked and matched before that rerun.
The guide content audit still reports 245 files, zero approved and 53 flagged.
No migration, production deployment, account messaging or publication occurred.
