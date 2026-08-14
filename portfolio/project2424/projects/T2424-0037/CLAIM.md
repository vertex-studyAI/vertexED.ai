# Claim — T2424-0037 NLP-to-CAD

## Falsifiable claim

For prompts inside the frozen controlled grammar for rectangular plates/panels/brackets, the compiler deterministically produces the expected numeric parametric geometry and bounded OpenSCAD source, while unsupported or unsafe geometry fails closed.

## Success conditions

The canonical regression suite must verify:

1. an 80×40×3 mm four-hole plate compiles to the frozen hole coordinates;
2. diameter input normalizes correctly to radius;
3. generated OpenSCAD contains only compiler-assembled bounded subtractive geometry and does not interpolate imports/includes from user text;
4. SVG/summary geometry agrees with the parsed specification;
5. unsupported object classes, unsupported hole counts, unsafe insets and out-of-envelope dimensions are rejected.

## Mechanism claim status — 2026-08-14

The original held-out-template benchmark showed a large engineering gap between the typed/validated compiler and the flat direct extractor. A separately frozen matched-validation component diagnostic then tested whether that gap actually isolated a typed-parser mechanism.

Frozen diagnostic outcome:

- current typed + validated compiler: `20/20`;
- original direct flat extraction: `12/20`;
- direct extraction + matched fail-closed validation: `20/20`;
- original gap: `0.40`;
- remaining typed-vs-validated-direct gap: `0.00`;
- validation recovery fraction: `1.00`;
- frozen interpretation: `VALIDATION_DOMINANT`.

Therefore **the v1 benchmark does not support a claim that the typed parser/IR itself caused the observed advantage**. On the reused bounded diagnostic, matched validation fully explains the old gap. This is a completed negative mechanism result and must remain preserved even if a later learned direct-vs-IR experiment is positive.

The original v1 19/20 result and its negative-width failure remain immutable; the current 20/20 score reflects the separately versioned post-v1 repair and does not rewrite history.

A stronger typed-IR claim is allowed only if the separately versioned, preregistered same-model learned direct-vs-IR experiment survives its frozen gate.

## Claim boundary

This is a controlled-language parametric compiler demo. It does not establish arbitrary natural-language understanding, arbitrary CAD generation, CAD-kernel correctness, manufacturing validity, production readiness, publication novelty, or research completion.

The current evidence also does **not** establish typed-IR mechanism superiority over a matched validated direct system. The strongest supported mechanism statement is that fail-closed validation is sufficient to recover the original flat-baseline gap on the bounded reused diagnostic.
