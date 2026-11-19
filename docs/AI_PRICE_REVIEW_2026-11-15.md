# VertexED AI price review, 15 November 2026

The reviewed AI policy in candidate #1172 expires on **16 November 2026 at 00:00 UTC / 05:30 IST**. The current official contracts still match its text-only model identities, prices and context bounds. This review renews the source policy for one week, ending **22 November 2026 at 00:00 UTC / 05:30 IST**.

## Reviewed contracts

The official model pages and deprecation schedule were opened on 15 November 2026.

| Pinned snapshot | Standard uncached input, USD / 1M tokens | Output, USD / 1M tokens | Context tokens | API shutdown |
| --- | ---: | ---: | ---: | --- |
| `gpt-4.1-mini-2025-04-14` | 0.40 | 1.60 | 1,047,576 | 14 January 2027 |
| `gpt-4o-mini-2024-07-18` | 0.15 | 0.60 | 128,000 | 14 January 2027 |

Sources: [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [GPT-4o mini](https://developers.openai.com/api/docs/models/gpt-4o-mini), and the [official deprecation schedule](https://developers.openai.com/api/docs/deprecations).

Both pinned models remain deprecated. Their shutdown date is separate from this shorter review deadline. A replacement requires its own pricing contract and quality checks; this change does not select or enable one. Published documentation does not prove account-specific availability.

## Scope and existing authority

The [beta access reconciliation](BETA_ACCESS_RECONCILIATION_2026-10-16.md) records the owner's authorization for the existing limits and requires a renewed model/rate review after expiry. The [9 November review](AI_PRICE_REVIEW_2026-11-09.md) records the previous one-week renewal. This change follows that review process; it does not raise limits or alter admission logic.

Policy `beta-usd-2026-11-15-v1` retains USD 1 per account and USD 10 per shared project per UTC day, 2 account and 8 project unresolved-operation limits, exact model snapshots, the text-only allowlist, full-context reservations, uncached input rates, default service tier, `store:false`, redirect rejection and 16–4096 output-token bounds. At 1,200 output tokens the reservations remain 420,951 and 19,920 microUSD. `validFrom` is unchanged.

The implementation still rejects expired or invalid policy times before reservation and provider dispatch. Existing settlement, uncertainty retention, account export and access controls are unchanged. This source change does not activate paid calls, modify usage records, apply a migration, merge a parent candidate or deploy production.

## Verification

Base: `2755266b35ec2239ff3117300d4c34586816a81b`, the exact integration head of draft #1172. The existing renewal regression now exercises the previous expiry, 16 November. With the old policy, the focused policy/runtime suites report **15 passed and 1 expected failure**: the previous deadline is denied. With the renewed policy, **16 passed, zero failed or skipped**.

The replay verifies reserve → dispatch → settlement, unchanged reservation and resource limits, zero RPC/provider calls at expiry and invalid times, duplicate-operation handling, quota/concurrency denial, uncertain exposure and cancellation. Local Node was 24.22.1. RPC/provider replies are synthetic. Because the full dependency installation is absent, a verification-only loader makes the unrelated Supabase SDK import fail if invoked and disables unmocked network access. That loader is not part of the application change. Full pinned-runtime repository CI and real provider/database behavior are not established by this local replay; hosted candidate results belong in the PR receipt.

Keep this review candidate draft under the parent's existing release conditions.
