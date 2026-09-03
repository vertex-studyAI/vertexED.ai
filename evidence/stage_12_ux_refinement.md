# VertexED Stage 12 — product UX refinement

**Local candidate:** `f53721f58d6979b98a893a26085e19fe050e4c10`

**Result:** PASS locally. The product is materially calmer, clearer, faster, and more
usable without changing the external publication boundary. `DEPLOYED_VERIFIED` remains
`false` until the canonical Vercel and Supabase targets are available.

## Product changes

- Replaced the animated landing headline with a stable, immediately readable promise:
  “Know what to study. Practise what matters.”
- Rebuilt the landing page around an explicit plan → attempt → feedback workflow and six
  clearly named tool actions.
- Removed the global WebGL cursor, particle canvas, pointer tracking, landing flip cards,
  typewriter dependency, tilt behavior, and scroll-trigger animation dependency.
- Replaced externally loaded decorative fonts with a system UI stack and reduced glass,
  glow, blur, shadow, motion, and corner radius across the shared surface system.
- Removed hidden duplicate route headings from the application shell.
- Added persistent labels, clearer instructions, and explicit action names to login,
  waitlist, invite, username, and password forms.
- Repaired math examples so complete equations render without nested delimiter fragments;
  hardened the shared automatic math enrichment path used by chat and review surfaces.
- Preserved private-beta gating, invite verification, account ownership, and existing
  authenticated learner workflows.

## Browser and interaction evidence

- Manual in-app browser inspection: desktop `1440 × 900` and mobile `390 × 844` for Home,
  Login, Signup, and Features.
- Mobile menu: opens with an accessible expanded state, closes on navigation, and leaves
  hidden navigation inert.
- Login failure state: empty submission exposes a visible `role="alert"` with actionable
  email guidance.
- Equation inspection: no literal or nested `$$$$` delimiter fragments remain in the
  rendered Features math section.
- Public journey matrix: **32/32 PASS** across 375, 390, 768, and 1440 pixel projects.
- Focused public-auth accessibility and fit matrix: **20/20 PASS** across 375, 390, 768,
  1024, and 1440 pixel viewports.
- Full local accessibility suite: **34 PASS, 2 inapplicable skips**.
- Authenticated golden journey: **1/1 PASS**, covering approved signup, onboarding,
  planner save, focused study, notes, quiz review, persistence, sign-out, login, and
  dashboard resume.

## Engineering evidence

- TypeScript application check: PASS.
- Source suite: **745/745 PASS**.
- Frozen evaluation suite: **25/25 PASS**.
- Production build: PASS, **2,755 modules** transformed, one Vercel function and 19 routed
  endpoints retained.
- Production dependency audit: **zero known vulnerabilities**. The transitive `qs`
  advisory was cleared with the compatible lockfile update to 6.16.0.
- Frozen performance budgets: PASS with zero violations.
  - Initial JavaScript: **176,930 bytes gzip** (budget 275,000).
  - Initial CSS: **33,798 bytes gzip** (budget 45,000).
  - Largest JavaScript asset: **232,813 bytes gzip** (budget 240,000).
  - Total JavaScript: **909,059 bytes gzip** (budget 1,000,000).
- Initial JavaScript decreased from 257,116 to 176,930 bytes gzip after removing unused
  theatrical runtime layers: a reduction of 80,186 bytes, or approximately **31.2%**.

## Publication boundary

The local candidate is publication-ready at the code and browser-test boundary. It is not
truthful to call the live release verified: the available Vercel identity still cannot
access the project that owns `www.vertexed.app`, and no approved Supabase staging or
production target is available. Follow `NEXT.md`; do not create a duplicate project or
claim measured learner outcomes.
