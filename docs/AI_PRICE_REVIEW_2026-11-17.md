# VertexED AI price review, 17 November 2026

The source policy retained by draft #1176 expires on **22 November 2026 at 00:00 UTC / 05:30 IST**. A fresh review of the official model pages and deprecation schedule confirms the same text-only model identities, prices and context bounds. This candidate sets the next review deadline to **24 November 2026 at 00:00 UTC / 05:30 IST**, seven calendar days after this review date. It does not extend the contract by a week beyond an already future expiry.

## Reviewed contracts

The official pages below were searched and opened on 17 November 2026.

| Pinned snapshot | Standard uncached input, USD / 1M tokens | Output, USD / 1M tokens | Context tokens | API shutdown |
| --- | ---: | ---: | ---: | --- |
| `gpt-4.1-mini-2025-04-14` | 0.40 | 1.60 | 1,047,576 | 14 January 2027 |
| `gpt-4o-mini-2024-07-18` | 0.15 | 0.60 | 128,000 | 14 January 2027 |

Sources: [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [GPT-4o mini](https://developers.openai.com/api/docs/models/gpt-4o-mini), and the [official deprecation schedule](https://developers.openai.com/api/docs/deprecations).

Both snapshots remain deprecated. Their API shutdown is separate from this short price-review deadline. Published documentation does not prove account-specific availability. A replacement model still needs a separately reviewed cost contract and quality checks; this candidate does not select or enable one.

## Scope and existing authority

The [beta access reconciliation](BETA_ACCESS_RECONCILIATION_2026-10-16.md) records owner authorization for the current limits and requires renewed model/rate review after expiry. The [15 November review](AI_PRICE_REVIEW_2026-11-15.md) records the preceding renewal. This change follows that existing process on a separate Ryan review branch.

Policy `beta-usd-2026-11-17-v1` retains USD 1 per account and USD 10 per shared project per UTC day, 2 account and 8 project unresolved-operation limits, exact snapshots, the text-only allowlist, full-context reservations, uncached input rates, default service tier, `store:false`, redirect rejection and 16–4096 output-token bounds. The `validFrom` time and all admission, settlement, quota and concurrency logic are unchanged. At 1,200 output tokens the reservations remain 420,951 and 19,920 microUSD.

The expiry guard still rejects at the new deadline, before the valid window, and for invalid clock values before either reservation or provider dispatch. This source candidate does not activate paid calls, alter usage records, apply a migration, merge #1176, deploy production, or resolve the production-domain failure.

## Verification

Base: `ea9b795dabbe46b2ce5b001eff863470afd4d08b`, the unchanged exact head of draft #1176. Twelve source/test dependency files were fetched at that commit and verified against their Git blob identities before execution.

The existing policy/runtime suites passed **16/16** on the original candidate. Updating the existing renewal regression to the prior expiry of 22 November reproduced **15 passed / 1 expected failure** with the old policy. With only the reviewed policy metadata renewed, the same suites passed **16/16**, zero skipped.

The tests cover reserve → dispatch → settlement, unchanged reservation and resource limits, zero RPC/provider calls at expiry and invalid times, duplicate operations, quota/concurrency denial, uncertainty retention, cancellation and the existing usage-view contract. Tests use injected synthetic RPC/provider responses. Local Node was 24.22.1, not the repository's pinned Node 22.22.0. The local dependency installation is absent; an external verification-only loader makes the unrelated Supabase SDK fail if invoked and blocks unmocked network access. No SDK, workflow, dependency or test assertion is weakened in the repository change. Full pinned-runtime CI is separate from this bounded replay and is recorded in the PR when available.

Keep this candidate draft under #1176's existing review, curriculum, release and production acceptance conditions.
