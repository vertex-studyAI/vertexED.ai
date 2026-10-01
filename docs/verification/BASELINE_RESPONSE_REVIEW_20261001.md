# Baseline response review and dependency refresh

Base source: `8b3567da59ffcd77824f7d24500ee65a54d3f047`.

The exact baseline component update handler retained a completed attempt and its previous `demonstrated-here` self-check after the response text changed. A local reproduction used the actual handler body and three completed synthetic items. Editing one answer incorrectly preserved all three self-checks.

The repair invalidates only the edited response's self-check and completion timestamp. Identical text and visibility changes preserve valid evidence. A fresh explicit self-check can complete the attempt again. The next-action text directs an unreviewed attempt back to comparison rather than treating the old self-check as current. It changes no grading, mastery, assessment, auth or data-sharing boundary.

Nine focused regression tests cover edits, clearing, whitespace, unchanged input, visibility, repeated review, state changes, unknown identities and the actual component transition. Before the dependency refresh, typecheck, lint/copy checks and all 1,197 application tests passed locally.

The canonical aggregate then correctly failed its production dependency gate: six high-severity dependency entries traced to the pinned brace-expansion 2.1.4 chain. This failure is retained separately; the gate was not weakened. The same report identified a low-severity DOMPurify advisory. The minimal lockfile update changes only brace-expansion 2.1.4 to 2.1.7 and DOMPurify 3.4.13 to 3.4.16, with corresponding root declarations. It does not establish that the deployed site was exploitable.

Primary patch references:
- https://github.com/advisories/GHSA-q2hr-2g5m-vwhr
- https://github.com/advisories/GHSA-qhr7-859c-m2p7
- https://github.com/advisories/GHSA-6j4f-fj2g-mc7p
- https://github.com/advisories/GHSA-p98j-92pf-mc4p

Final checks and deployment status must be read from the exact final revision's receipt. No merge or production deployment is authorized by this document. The separate custom-domain transport and hosted configuration gates remain unchanged.

Local final verification: Node 22.22.0 / npm 10.9.8; canonical `npm run ci` passed, including 1,197 application tests, 25 evaluation tests, build, dependency and bundle gates. The nine focused response-version regressions also passed. A browser regression now covers answer edits, saved-state reloads, three viewport widths and reduced motion using the existing isolated mock-service harness. Local Chromium download was truncated; the installed system Chromium failed before test execution with an operating-system socket permission error, including an approved retry. Browser assertions therefore remain unverified locally and require hosted CI. No security check was weakened.

The review branch uses the repository's existing `research/**` no-deployment policy so this verification does not publish a preview or change production. Standard public GitHub-hosted CI is the intended browser-verification route; no provider benchmark workflow or paid service is requested.
