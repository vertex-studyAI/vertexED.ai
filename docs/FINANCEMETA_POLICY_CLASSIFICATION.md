# FinanceMeta policy classification matrix

This matrix is the review target for the enforcement stage after explicit membership exists and historical identities are reconciled. It is intentionally conservative: the classification is about **authorization intent**, not whether a table happens to contain rows today.

| Surface class | Intended browser rule | Examples to classify | Enforcement shape |
|---|---|---|---|
| Public discovery | May remain reachable without FinanceMeta membership only when product requirements explicitly say so | public events/chapters/research discovery where intentional | retain documented `anon`/public read only; no member predicate |
| Member read | FinanceMeta members may browse | member directory, active programs, member-only cohorts | `TO authenticated USING ((select financemeta_private.financemeta_is_member()))` |
| Owner read/write | Member may access only own row | preferences, registrations, interests, own introductions/applications | member predicate **and** `auth.uid() = user_id/author_id/applicant_id` |
| Lead/reviewer | Explicit member plus reviewed lead/reviewer predicate | lab review, evidence review | member predicate plus existing lead/admin relationship |
| Admin | Explicit member plus admin role | editorial/publishing/admin mutation | member predicate plus admin helper |
| Server-only | Browser has no direct privilege | membership authorization table, privileged audit log | revoke `anon`/`authenticated`; server-only path |

## Rewrite rules

1. **Do not mechanically make every table member-only.** Existing anonymous discovery policies on chapters/events/research may be intentional and must be product-reviewed.
2. Any row-owner mutation that remains browser-accessible must require both explicit membership and owner equality. Generic Auth ownership alone is not FinanceMeta authorization in the shared project.
3. Admin/lead predicates must eventually require explicit membership too; profile role alone is not sufficient while profiles are auto-created.
4. `financemeta_member_profiles` and onboarding should become profile/setup data for already-authorized members, not the source of authorization.
5. The Auth creation trigger must stop materializing FinanceMeta member state for generic shared-project users only after the replacement enrollment path is proven.
6. No historical profile row should be bulk-promoted into `financemeta_memberships` without independent evidence.
7. Every rewritten policy needs member and non-member regression cases plus any owner/lead/admin cases it represents.

## Read-only inventory

Run `docs/FINANCEMETA_POLICY_AUDIT.sql` to list current policy expressions and table grants. The query labels obvious authenticated-wide and identity-only policies to accelerate review; those labels are heuristics, not automatic migration instructions.
