# Paper Build Contract

A Project 2424 manuscript build is green only if:

1. LaTeX compiles without missing citations/references;
2. every table/figure is generated or traceable to frozen artifacts;
3. the final PDF contains no TODO/TBD/placeholder tokens;
4. the title/abstract/conclusion match the claim ledger;
5. manuscript metadata identifies the exact code/evidence release;
6. no project is called preprint-ready while `EVIDENCE.json.preprint_gate` is false.

The build must fail closed on placeholder Results.