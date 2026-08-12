# Bu1LD + FinanceMeta website content launch wave — 12 Aug 2026

This package is an execution artifact for the public-content launch wave. It is deliberately target-SHA-bound and fail-closed.

## Canonical targets inspected

- The Bu1LD: `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`
- FinanceMeta landing: `build-the-future-11/FinanceMeta-Landing@f9265ce6ae94bf01048271ecfcf09d5be7059604`
- FinanceMeta portal: `build-the-future-11/finance4all-global-reach@fbdd503223edc5b1780509720391083f485a4a85`

Direct target branch creation was attempted for FinanceMeta Landing and Bu1LD and returned `403 Resource not accessible by integration`. Repository permission metadata advertises push, but that is not treated as effective write access.

## P0 findings

### FinanceMeta

The standalone landing still uses the legacy `Finance 4All` name, generic feature cards, and an email-only primary CTA.

The richer portal also publishes unsupported or insufficiently sourced public claims including `25,000+ Students Impacted`, `15+ Countries`, `50+ Global Members`, broad university-research mentor language, and a partner/collaborator logo-style list. Those claims must be removed or downgraded until a dated evidence source and metric definition exist.

The code does, however, substantiate a real product surface: Finance Debriefed, beginner explainers, Finance Meta Labs, Axiom Pathways, authentication/member workflows, saved items, events, and research/opportunity routes. The content recovery therefore centers those inspectable product surfaces rather than aspirational institutional claims.

### The Bu1LD

The public information architecture is already substantial. Its main content risk is evidence density and one known overstatement: `Six labs — published research divisions`. The current repository evidence supports the existence of six research directions/divisions in the platform, not a blanket claim that all six are published research divisions.

The repository's research registry also explicitly distinguishes evidence levels and records real local evidence for Project Genesis, GenesisE, Bu1LD product release tests, and FinanceMeta validation while prohibiting stronger external/public claims.

## Contents

- `apply-financemeta-content-wave.mjs` — exact-SHA-gated content recovery for both FinanceMeta public repositories.
- `apply-bu1ld-proof-density.mjs` — exact-SHA-gated truth/proof-density recovery for Bu1LD.
- `PUBLIC_CLAIMS_AUDIT.md` — initial claim disposition and public wording boundaries.

## Application contract

These scripts refuse to run unless the checkout is on the exact inspected target SHA. They make no production deployment, database mutation, credential change, or analytics/user-data mutation. After application, normal repository release gates must be run and the resulting target branch reviewed before deployment.
