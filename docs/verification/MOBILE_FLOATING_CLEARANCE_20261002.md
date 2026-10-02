# Mobile floating-control clearance — 2 October 2026

## Scope

This patch is based on integrated candidate PR #1098 at `2b0db6e3ae3bd3613c5e7ff0bc9f108798d59a33`. The inspected `src/styles/navigation.css` blob is `989c61441ea137815dbfc796a98b404ae324b700`.

At widths of 700 CSS pixels or less, authenticated pages render `.learning-bottom-nav` as a fixed bottom dock. The feedback launcher and default, unpositioned Apex launcher previously retained viewport-bottom offsets, placing them inside the dock's occupied band. The new rule lifts both default launchers above the dock and includes safe-area inset clearance.

Saved learner-selected Apex positions keep their inline coordinates; this patch does not overwrite that preference. Both launchers remain visible and keyboard reachable.

## Changed repository files

- `src/styles/navigation.css`
- `tests/mobile-floating-clearance.test.mjs`
- `docs/verification/MOBILE_FLOATING_CLEARANCE_20261002.md`

## Verification boundary

The dependency-free source regression checks that the rule is present only inside the existing mobile breakpoint, covers both launchers, includes safe-area clearance, and does not hide either control. It is a local source/fixture check, not a browser layout, preview, or production certification. Hosted exact-head browser checks must still measure non-intersection with `.learning-bottom-nav` at 390 px, exercise keyboard focus and reduced motion, and inspect screenshots before the all-UI-clearance criterion can pass.

No deployment, DNS, authentication, database, migration, secret, analytics, research, or learner-data change is included.
