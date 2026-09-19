# Publication-readiness cut order — 2026-09-19 02:56 UTC

Dirty tree: `codex/vertexed-publication-readiness` (do not merge wholesale).

## Rule
**Do not open a second agents/API PR** that duplicates draft **#917**. Land or close #917 first.

## Recommended order after #918 (merged)
1. Wait for / contribute to **#917** (agents network) — already has CI.
2. Next slice from dirty tree: **C_myp_content_practice** (content-only, lower blast radius).
3. Then **D_study_ux_pages_libs** + matching **F_tests_e2e** for those pages.
4. Then **E_layout_a11y_styles**.
5. **G_docs_ci_config** last or with each slice.
6. Skip **A_api_agents_*** / **B_apex_agent_ui** until #917 disposition is clear.

Inventory: `PUBLICATION_READINESS_SLICE_INVENTORY_2026-09-19.md`
