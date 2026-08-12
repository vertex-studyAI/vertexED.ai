# Protocol — T2424-0037 NLP-to-CAD

## Frozen minimum protocol

**PROJECT:** T2424-0037 — NLP-to-CAD  
**CLAIM:** Controlled rectangular-plate prompts compile deterministically to the intended bounded parametric geometry and unsupported/unsafe prompts fail closed.  
**PRIMARY METRIC:** exact parsed geometry / expected rejection across the frozen regression fixtures.  
**BASELINE:** no free-form fallback; unsupported grammar is rejected rather than guessed.  
**SEEDS:** none; deterministic parser/compiler.  
**DATA:** fixed prompt strings embedded in `tests/nlpToCad.test.mjs`.  
**SUCCESS THRESHOLD:** every frozen positive and negative fixture passes.  
**FAILURE THRESHOLD:** any incorrect geometry, unsafe acceptance, user-text injection into CAD source, or missing rejection.  
**NEGATIVE CONTROL:** unsupported gear prompt and unsafe dimensions/hole layouts.  
**ABLATION:** diameter-vs-radius normalization and zero-hole geometry exercise different parser/geometry branches.  
**EXPECTED COST:** seconds on Node.js; no external service or paid API.

## Reproduce

```bash
node --test tests/nlpToCad.test.mjs
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Then open `/web/` for the local browser demo.

## Interpretation rule

Passing this protocol supports only the controlled compiler mechanics claim. It must not be upgraded to general NLP-to-CAD, manufacturing, CAD-kernel, or scientific-validation claims.
