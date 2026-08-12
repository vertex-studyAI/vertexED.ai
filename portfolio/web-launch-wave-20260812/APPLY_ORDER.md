# Target application order

This is the exact next execution sequence once effective target write access is available (or from local checkouts with push rights).

## 1. FinanceMeta

Start from clean checkouts pinned to:

- `build-the-future-11/FinanceMeta-Landing@f9265ce6ae94bf01048271ecfcf09d5be7059604`
- `build-the-future-11/finance4all-global-reach@fbdd503223edc5b1780509720391083f485a4a85`

Run:

```bash
node portfolio/web-launch-wave-20260812/apply-financemeta-content-wave.mjs \
  /path/to/FinanceMeta-Landing \
  /path/to/finance4all-global-reach
```

Then inspect both diffs before committing.

Minimum verification:

### FinanceMeta-Landing

```bash
npm ci
npm run build
```

Manually inspect desktop and mobile rendering and confirm:

- `Finance 4All` is gone from the public landing;
- primary content is FinanceMeta / Learn–Research–Build–Opportunities–Community;
- no impact/member/country/partner statistics are present;
- no dead primary CTA.

### finance4all-global-reach

Run the repository's normal lint/typecheck/test/build/release gates. At minimum:

```bash
npm ci
npm run lint
npm run test
npm run build
```

Then run the repository release/security checks documented in that target before production.

Content assertions:

- no `25,000+ Students Impacted` public block;
- no `15+ Countries` public block;
- no `50+ Global Members` public block;
- no Jane Street / Stanford / MIT / UChicago / generic partner wall in the public Programs section;
- FinanceMeta naming is used in UI/metadata surfaces patched by the script;
- Finance Debriefed, Finance Meta Labs, Axiom Pathways and the member workspace remain reachable.

## 2. The Bu1LD

Start from clean checkout pinned to:

- `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`

Run both content scripts before committing (git HEAD remains pinned until you commit):

```bash
node portfolio/web-launch-wave-20260812/apply-bu1ld-proof-density.mjs /path/to/bu1ld-landing
node portfolio/web-launch-wave-20260812/apply-bu1ld-p0-people.mjs /path/to/bu1ld-landing
```

Then run the target's canonical gates:

```bash
bun test
bun run typecheck
bun run lint
bun run build
bun run release:check
```

Use the target's stricter live release gate only with the required real backend credentials/environment; do not bypass it.

Content assertions:

- stats say `Six labs — research divisions in the platform`;
- no generic `Lab contributors` pseudo-person is publicly rendered;
- homepage contains a bounded evidence-highlights section;
- Project Genesis is described only as retained local/smoke/ablation evidence;
- GenesisE is explicitly synthetic, not real-market validation;
- evidence links go to the retained public index;
- the public evidence route remains the canonical live evidence register.

## 3. Production boundary

Passing local/source checks does not equal public verification. After canonical branches are reviewed and deployed, re-run public-route, responsive, keyboard, auth/application, and exact-revision checks against the served domains before changing `PUBLIC_VERIFIED` to PASS.
