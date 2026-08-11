# Product Execution Handoff — 11 August 2026

This handoff covers The Bu1LD, FinanceMeta, and VertexED. It separates source readiness, tested recovery artifacts, and production proof.

## 1. The Bu1LD

### Current state

Canonical public repository: `ryangomez010/bu1ld-landing`.

The repository already contains a substantive release package. Its retained Pass Two report records:

- typecheck PASS;
- `release:check` PASS;
- `audit:ci` PASS;
- route smoke PASS across 22 paths;
- production build PASS;
- public HTTP probe PASS across 12 routes with canonicals;
- live deploy / live phase33 blocked on credentials.

The public navigation is currently project/evidence-oriented (`Projects`, `Labs`, `Programs`, `Publications`, `Evidence`) with a `Find a project` CTA. That is a defensible conversion choice even though it differs from the older generic site outline.

### Integrity fix identified but not landed

`src/data/landing.ts` currently contains:

```ts
["Six labs", "published research divisions"]
```

The repository claim ledger classifies the six-lab statement as repository-inferred rather than independently verified. To avoid publication ambiguity, change it to:

```ts
["Six labs", "research divisions in the platform"]
```

A direct GitHub contents write was attempted in this session and returned `403 Resource not accessible by integration`, so this is an exact pending patch, not a landed change.

### Release gate

Do not redesign the homepage before production certification. Finish, in order:

1. Apply/verify the required live Supabase migration (`phase33`) with owner credentials.
2. Configure required Cloudflare/server secrets and auth URLs.
3. Run the repository's strict production release gate.
4. Execute role-separated allow/deny smoke tests against the real backend.
5. Deploy only after the same source revision passes the strict gate.
6. Probe public routes, canonical metadata, project application flow, and hydration from the deployed URL.

### Launch copy — use only after the production gate passes

> The Bu1LD is an independent ML research and builder institution for people who want to turn scoped technical questions into reproducible work. Explore open projects, research labs and programs—and see the evidence behind what we claim.

Primary CTA: **Find a project**  
Secondary CTA: **Inspect public evidence**

## 2. FinanceMeta

### Canonical surfaces

- `build-the-future-11/FinanceMeta-Landing` — tiny public landing repository.
- `build-the-future-11/finance4all-global-reach` — richer React/Vite/Supabase portal and the canonical product target in current control evidence.
- `build-the-future-11/FinanceMeta-Global` — FI-JEPA/research content, not the website.

### Landing failure and certified recovery

At the currently inspected target commit, the landing shell has an entrypoint/stylesheet/configuration failure boundary. A recovery patch stored in the VertexED control plane has already been validated with strict TypeScript, production build, dependency checks, desktop Chromium, Pixel 7 emulation, theme persistence, focus and overflow checks.

That recovery is **tested but not applied to the target repository** because target branch creation returns `403 Resource not accessible by integration`.

### Portal security/release boundary

The richer FinanceMeta portal has tested control-plane authorization-hardening work, including protection against profile-role escalation and direct notification insertion, but the reviewed overlay has not been applied to the target repository or live Supabase.

Do not announce production launch until both the landing recovery and portal authorization gate are integrated and revalidated on the canonical target.

### Required funnel after integration

`VISITOR → understands FinanceMeta → chooses program/resource/opportunity → CTA → application/signup → onboarding/community destination`

Recommended analytics events:

- `page_view`
- `join_click`
- `application_start`
- `application_complete`
- `program_click`
- `resource_click`

Never send form free text, email addresses or sensitive profile data as analytics properties.

### Distribution copy — ready for the eventual verified launch

**LinkedIn**

> FinanceMeta is building one place for financial education, research, technology and opportunity. Instead of stopping at content, the platform connects learning pathways with labs, competitions, projects and ways to contribute. We are opening the next public version after a release and security pass focused on making every major page lead to a real next action. If you want to learn, build, research, compete or help create the next program, start with the pathway that fits you.

**Discord**

> FinanceMeta’s next public version is ready for rollout once the final production gate clears. The goal is simple: every page should help you find something useful to learn, build, research, compete in or contribute to. When the verified link is posted, please try one full path from landing page → opportunity → signup/application and report anything confusing or broken.

**Existing-member DM**

> We’re tightening FinanceMeta into a real opportunity funnel rather than a collection of pages. When the verified public build goes live, could you try one path you actually care about—program, lab, competition or resource—and tell me where you hesitate, get confused or hit a dead end?

**Partner outreach**

> We’re preparing the next verified public release of FinanceMeta, a platform connecting financial education with research, technology, competitions and student opportunities. I’d like to explore one concrete collaboration rather than a logo exchange: a workshop, challenge, resource, mentor session or student pathway with a clear participant outcome. If that aligns with your work, I can send a short proposal after the production release gate clears.

## 3. VertexED.ai

### Current state

The public site is live and clearly communicates a five-step revision loop: plan → focus → practise → review → remember, with six product tools and a private-beta/waitlist path.

The source repository already has a serious canonical CI command covering lint, TypeScript, Vercel function validation, high-severity production dependency audit, tests, eval tests and production build. It also contains Playwright smoke/accessibility commands and privacy-safe activation analytics.

### Current P0

The latest scheduled `Production Health Monitor` remains red. The public smoke step itself completes, then the workflow deliberately fails because production does not satisfy the retained health/revision contract. Open incident #137 is the current source of truth.

Do **not** respond by adding features. Resolve production identity first.

### Activation definition

A user is **activated** when they complete onboarding, save a real planner artifact, can later retrieve it, and understand the next action in the revision loop. AI-request success is a supporting product metric, not a substitute for the persisted return loop.

### Exact 10-user test procedure

1. Recruit 10 students who match at least one supported exam/curriculum use case; do not coach them through the UI.
2. Give each user only this prompt: “You have an exam or deadline coming up. Use VertexED to decide what to do, complete one useful study action, and come back to the saved work.”
3. Observe first visit → waitlist/invite → signup → onboarding → planner save → one core feature → later retrieval.
4. Record whether each user reaches activation without help and where they stop.
5. Run at least three sessions at ~390 px mobile width and the rest across ordinary desktop/laptop browsers.
6. For invited disposable test accounts, verify logout and that protected content is denied afterward.
7. Do not record private study prompts/answers in analytics or the test notes; record only step completion, confusion point and severity.
8. Classify every issue P0/P1/P2. Fix P0 before recruiting the next batch if it blocks the journey.
9. Re-run the same journey after each P0 fix.
10. Publish only aggregate activation/failure counts; do not turn 10-user testing into a traction claim.

### Five tester questions

1. What did you think VertexED would help you do first?
2. Where did you hesitate or feel unsure what to click?
3. What did you create or finish that felt genuinely useful?
4. If you returned tomorrow, what would you expect to still be there?
5. What single thing would make you choose this over your current study workflow?

### Onboarding DM

> You’re in the VertexED test group. Please use it like you actually study—don’t try to be nice to the product. Pick a real exam/deadline, make a plan, complete one useful action, then return to the saved work later. If anything is confusing or breaks, tell me exactly where you got stuck; that is more useful than general feedback.

### Feedback form fields

- Device/browser category
- Curriculum/exam category
- Did signup/onboarding complete? yes/no
- Did you save a planner artifact? yes/no
- Could you retrieve it later? yes/no
- Which core tool did you use?
- Where did you get stuck?
- Severity: blocker / confusing / cosmetic
- What outcome did you expect at that point?
- Would you return for the next study session? yes/no + optional reason

### Metrics dashboard

Primary funnel:

`VISIT → WAITLIST/INVITE → ACCOUNT CREATED → ONBOARDING COMPLETED → PLANNER SAVED → PLANNER RETRIEVED → CORE FEATURE USED → D1/D7 RETURN`

Operational guardrails:

- production health/revision match;
- API request success/timeout/failure by fixed feature category;
- logout success;
- account deletion success;
- cloud-vs-device planner persistence outcome.

## Cross-product P0 order

1. VertexED: restore exact production revision health and run authenticated saved-artifact golden journey.
2. FinanceMeta: restore effective target-repo write access, integrate the already-tested landing/security recoveries on isolated branches, then production denial-path/user-flow verification.
3. The Bu1LD: restore effective target write/backend access, remove the ambiguous publication wording, apply/verify live DB gate and deploy from a strict green release revision.

Do not use new features, visual redesigns, or inflated metrics to substitute for these gates.
