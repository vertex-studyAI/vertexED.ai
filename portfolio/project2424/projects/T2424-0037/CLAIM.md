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

## Claim boundary

This is a controlled-language parametric compiler demo. It does not establish arbitrary natural-language understanding, arbitrary CAD generation, CAD-kernel correctness, manufacturing validity, production readiness, publication novelty, or research completion.
